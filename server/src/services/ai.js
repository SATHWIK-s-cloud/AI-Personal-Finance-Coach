const { calculateCategorySpending, calculateFinancialHealthScore } = require('./analysis');
const { round2, round1 } = require('../utils/helpers');

const CATEGORY_KEYWORD_MAP = {
  Rent: ["rent", "apartment", "pg", "house rent", "flat rent", "landlord", "maintenance"],
  Food: ["food", "groceries", "grocery", "zomato", "swiggy", "supermarket", "restaurant", "cafe", "coffee", "dinner", "lunch", "breakfast", "blinkit", "zepto"],
  Transport: ["uber", "ola", "metro", "cab", "taxi", "bus", "train", "flight", "petrol", "fuel", "diesel", "auto", "rapido"],
  Shopping: ["amazon", "flipkart", "clothes", "zara", "h&m", "myntra", "meesho", "shopping", "shoes", "electronics", "gadget", "mall"],
  Entertainment: ["netflix", "spotify", "prime", "movie", "cinema", "theatre", "gaming", "steam", "concert", "hotstar", "bookmyshow", "pub"],
  Bills: ["electricity", "water", "wifi", "internet", "broadband", "mobile bill", "recharge", "gas", "utility", "insurance", "lic"]
};

const RECURRING_KEYWORDS = ["rent", "netflix", "spotify", "subscription", "bill", "recharge", "electricity", "wifi", "broadband", "insurance", "monthly", "maintenance"];

function suggestExpenseCategory(description = '') {
  const text = description.toLowerCase().trim();
  const is_recurring = RECURRING_KEYWORDS.some(kw => text.includes(kw));

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return { category, confidence: 0.95, is_recurring };
      }
    }
  }

  return { category: "Other", confidence: 0.50, is_recurring };
}

function detectRecurringExpenses(expenses = []) {
  return expenses.map(exp => {
    const desc = (exp.description || '').toLowerCase();
    let is_rec = exp.is_recurring || false;

    if (!is_rec) {
      if (RECURRING_KEYWORDS.some(kw => desc.includes(kw)) || ['Rent', 'Bills'].includes(exp.category)) {
        is_rec = true;
      }
    }

    return {
      ...exp,
      is_recurring: is_rec
    };
  });
}

function analyzeSpendingPatterns(income, currentExpenses = [], previousMonthCategoryTotals = {}) {
  const categoryTotals = calculateCategorySpending(currentExpenses);
  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const activeCategories = Object.entries(categoryTotals).filter(([_, amt]) => amt > 0);
  let highest_spending_category = { category: "None", amount: 0.0 };
  let lowest_spending_category = { category: "None", amount: 0.0 };

  if (activeCategories.length > 0) {
    activeCategories.sort((a, b) => b[1] - a[1]);
    highest_spending_category = { category: activeCategories[0][0], amount: activeCategories[0][1] };
    lowest_spending_category = { category: activeCategories[activeCategories.length - 1][0], amount: activeCategories[activeCategories.length - 1][1] };
  }

  const unusual_spending_alerts = [];
  const inc = Number(income) || 0;

  for (const [cat, amt] of Object.entries(categoryTotals)) {
    const prevAmt = Number(previousMonthCategoryTotals[cat]) || 0;
    if (prevAmt > 0) {
      const diffPct = ((amt - prevAmt) / prevAmt) * 100;
      if (diffPct >= 25 && amt >= 2000) {
        unusual_spending_alerts.push({
          category: cat,
          current_amount: amt,
          previous_amount: prevAmt,
          percentage_increase: round1(diffPct),
          message: `High Spending Alert: ${cat} expenses are ${diffPct.toFixed(0)}% higher than your previous monthly average.`
        });
      }
    } else if (inc > 0 && amt > (inc * 0.15) && ['Shopping', 'Entertainment'].includes(cat)) {
      unusual_spending_alerts.push({
        category: cat,
        current_amount: amt,
        previous_amount: 0,
        percentage_increase: 100.0,
        message: `Discretionary Alert: ${cat} spending takes up ${((amt / inc) * 100).toFixed(1)}% of your monthly income.`
      });
    }
  }

  return {
    highest_spending_category,
    lowest_spending_category,
    total_monthly_spending: round2(totalSpending),
    category_breakdown: categoryTotals,
    unusual_spending_alerts
  };
}

function getMonthlyComparison(currentExpenses = [], previousMonthTotals = {}) {
  const currentTotals = calculateCategorySpending(currentExpenses);
  const currentGrandTotal = Object.values(currentTotals).reduce((a, b) => a + b, 0);
  const previousGrandTotal = Object.values(previousMonthTotals).reduce((a, b) => a + (Number(b) || 0), 0);

  const diffAmount = currentGrandTotal - previousGrandTotal;
  const pctChange = previousGrandTotal > 0 ? (diffAmount / previousGrandTotal) * 100 : 0.0;

  const category_changes = [];
  Object.keys(currentTotals).forEach(cat => {
    const curr = currentTotals[cat] || 0;
    const prev = Number(previousMonthTotals[cat]) || 0;
    const cDiff = curr - prev;
    const cPct = prev > 0 ? (cDiff / prev) * 100 : (curr > 0 ? 100.0 : 0.0);

    category_changes.push({
      category: cat,
      current: round2(curr),
      previous: round2(prev),
      change_amount: round2(cDiff),
      change_percentage: round1(cPct)
    });
  });

  return {
    current_month_total: round2(currentGrandTotal),
    previous_month_total: round2(previousGrandTotal),
    total_change_amount: round2(diffAmount),
    total_percentage_change: round1(pctChange),
    category_changes
  };
}

function generateAIInsights(income, expenses = [], budget = {}, goal = {}) {
  const inc = Number(income) || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const savings = inc - totalExpenses;
  const savingsRate = inc > 0 ? (savings / inc) * 100 : 0;
  const catSpending = calculateCategorySpending(expenses);

  const insights = [];

  // 1. Savings Rate Fact
  insights.push({
    id: "ins-1",
    type: "fact",
    category: "Savings",
    title: "Monthly Savings Rate",
    text: `Your current savings rate is ${savingsRate.toFixed(1)}% (₹${savings.toLocaleString()} saved out of ₹${inc.toLocaleString()} income).`,
    badge: "Calculated Metric",
    badge_color: "bg-emerald-100 text-emerald-800 border-emerald-300"
  });

  // 2. Discretionary Spending Fact
  const disc = (catSpending.Shopping || 0) + (catSpending.Entertainment || 0);
  if (disc > 0) {
    const discPct = inc > 0 ? (disc / inc) * 100 : 0;
    insights.push({
      id: "ins-2",
      type: "fact",
      category: "Spending Pattern",
      title: "Discretionary Spending",
      text: `Shopping and Entertainment total ₹${disc.toLocaleString()} (${discPct.toFixed(1)}% of total income).`,
      badge: "Fact",
      badge_color: "bg-blue-100 text-blue-800 border-blue-300"
    });
  }

  // 3. AI Recommendation: Smart Cost Reduction
  if (disc > 2000) {
    const potentialSave = disc * 0.35;
    insights.push({
      id: "ins-3",
      type: "recommendation",
      category: "Optimization",
      title: "Smart Cost Reduction",
      text: `You could potentially save up to ₹${potentialSave.toLocaleString()} per month by trimming non-essential Shopping & Dining expenses.`,
      badge: "AI Advice",
      badge_color: "bg-indigo-100 text-indigo-800 border-indigo-300"
    });
  }

  // 4. Savings Goal Projection
  const targetAmt = Number(goal.target_amount) || 50000;
  const currSavings = Number(goal.current_savings) || 15000;
  const needed = targetAmt - currSavings;
  if (needed > 0 && savings > 0) {
    const monthsNeeded = Math.ceil(needed / savings);
    insights.push({
      id: "ins-4",
      type: "recommendation",
      category: "Goal Tracking",
      title: "Goal Timeline Estimate",
      text: `At your current monthly savings rate (₹${savings.toLocaleString()}/mo), you are on track to reach your ₹${targetAmt.toLocaleString()} goal in approx ${monthsNeeded} months.`,
      badge: "AI Projection",
      badge_color: "bg-purple-100 text-purple-800 border-purple-300"
    });
  }

  return insights;
}

function generateChatResponse(message = '', income, expenses = [], budget = {}, goal = {}) {
  const msgLower = message.toLowerCase();
  const inc = Number(income) || 0;
  const catSpending = calculateCategorySpending(expenses);
  const totalExpenses = Object.values(catSpending).reduce((a, b) => a + b, 0);
  const savings = inc - totalExpenses;
  const savingsRate = inc > 0 ? (savings / inc) * 100 : 0;

  if (msgLower.includes('save') || msgLower.includes('10,000') || msgLower.includes('10000') || msgLower.includes('goal')) {
    const target = 10000;
    const diff = target - savings;
    const topCats = Object.entries(catSpending).sort((a, b) => b[1] - a[1]);
    const topDisc = topCats.filter(c => ['Shopping', 'Entertainment', 'Food'].includes(c[0]));

    if (diff <= 0) {
      return `Great news! You are currently saving ₹${savings.toLocaleString()} per month (${savingsRate.toFixed(1)}% rate), which already meets or exceeds your ₹10,000 target. To boost it further, focus on trimming ${topDisc[0] ? topDisc[0][0] : 'discretionary items'}.`;
    } else {
      let suggestion = `To reach a ₹${target.toLocaleString()} monthly savings goal from your current ₹${savings.toLocaleString()} savings, you need an extra ₹${diff.toLocaleString()}.\n\n`;
      suggestion += "Here is your customized action plan:\n";
      if (topDisc[0]) {
        suggestion += `1. Reduce ${topDisc[0][0]} spending by 25% (saves approx ₹${(topDisc[0][1] * 0.25).toLocaleString()}/mo).\n`;
      }
      if (topDisc[1]) {
        suggestion += `2. Limit ${topDisc[1][0]} purchases by 20% (saves approx ₹${(topDisc[1][1] * 0.20).toLocaleString()}/mo).\n`;
      }
      suggestion += "3. Set rigid category budget limits in the Budget & Savings tab to keep track of weekly limits.";
      return suggestion;
    }
  } else if (msgLower.includes('spend') || msgLower.includes('most') || msgLower.includes('highest')) {
    const activeCats = Object.entries(catSpending).filter(c => c[1] > 0).sort((a, b) => b[1] - a[1]);
    const topCat = activeCats[0] || ["None", 0];
    const pct = inc > 0 ? (topCat[1] / inc) * 100 : 0;
    return `Your highest spending category is **${topCat[0]}** at **₹${topCat[1].toLocaleString()}**, accounting for **${pct.toFixed(1)}%** of your total income. Rent and Food are essential, but reviewing discretionary items like Shopping (₹${(catSpending.Shopping || 0).toLocaleString()}) will unlock significant savings.`;
  } else if (msgLower.includes('reduce') || msgLower.includes('cut') || msgLower.includes('lower')) {
    const discTotal = (catSpending.Shopping || 0) + (catSpending.Entertainment || 0) + (catSpending.Other || 0);
    return `Your discretionary expenses (Shopping, Entertainment & Other) total **₹${discTotal.toLocaleString()}** per month. By setting a strict budget cap of 15% below current levels, you will instantly free up **₹${(discTotal * 0.15).toLocaleString()}** every month without compromising your lifestyle.`;
  } else if (msgLower.includes('health') || msgLower.includes('score')) {
    const health = calculateFinancialHealthScore(inc, expenses, budget);
    return `Your current Financial Health Score is **${health.score}/100** (${health.tier}). ${health.explanation}`;
  } else {
    return `Based on your financial profile: Monthly Income is ₹${inc.toLocaleString()}, Total Expenses are ₹${totalExpenses.toLocaleString()}, giving you net savings of ₹${savings.toLocaleString()} (${savingsRate.toFixed(1)}% savings rate). Ask me how to optimize specific categories or reach your savings targets!`;
  }
}

module.exports = {
  suggestExpenseCategory,
  detectRecurringExpenses,
  analyzeSpendingPatterns,
  getMonthlyComparison,
  generateAIInsights,
  generateChatResponse
};
