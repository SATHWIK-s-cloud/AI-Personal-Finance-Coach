const { CATEGORIES, round2, round1 } = require('../utils/helpers');

function calculateSummary(income, expenses = []) {
  const inc = Number(income) || 0;
  const total_expenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const savings = inc - total_expenses;
  const savings_rate = inc > 0 ? (savings / inc) * 100 : 0;

  return {
    income: round2(inc),
    total_expenses: round2(total_expenses),
    savings: round2(savings),
    savings_rate: round1(Math.max(0, savings_rate))
  };
}

function calculateCategorySpending(expenses = []) {
  const totals = {};
  CATEGORIES.forEach(cat => { totals[cat] = 0.0; });

  expenses.forEach(exp => {
    const cat = exp.category && CATEGORIES.includes(exp.category) ? exp.category : 'Other';
    totals[cat] += Number(exp.amount) || 0;
  });

  const rounded = {};
  Object.keys(totals).forEach(cat => {
    rounded[cat] = round2(totals[cat]);
  });
  return rounded;
}

function calculateFinancialHealthScore(income, expenses = [], budget = {}) {
  const inc = Number(income) || 0;
  if (inc <= 0) {
    return {
      score: 0,
      tier: "Needs Attention",
      explanation: "No income recorded. Add your monthly income to compute your financial health score.",
      breakdown: {
        savings_rate_score: 0,
        budget_compliance_score: 0,
        discretionary_control_score: 0,
        emergency_fund_score: 0
      }
    };
  }

  const total_expenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const savings = inc - total_expenses;
  const savings_rate = (savings / inc) * 100;

  const categoryTotals = calculateCategorySpending(expenses);
  const discretionary = (categoryTotals.Shopping || 0) + (categoryTotals.Entertainment || 0) + (categoryTotals.Other || 0);
  const discretionary_pct = (discretionary / inc) * 100;

  const total_budget = Number(budget.total_budget) || (inc * 0.8);
  const budget_usage_pct = total_budget > 0 ? (total_expenses / total_budget) * 100 : 100;

  // 1. Savings Rate Score (0 - 40 points)
  let savings_score = 0;
  if (savings_rate >= 30) savings_score = 40;
  else if (savings_rate >= 20) savings_score = 35;
  else if (savings_rate >= 10) savings_score = 25;
  else if (savings_rate >= 0) savings_score = 15;

  // 2. Budget Compliance Score (0 - 30 points)
  let budget_score = 5;
  if (budget_usage_pct <= 80) budget_score = 30;
  else if (budget_usage_pct <= 95) budget_score = 22;
  else if (budget_usage_pct <= 100) budget_score = 15;

  // 3. Discretionary Control Score (0 - 20 points)
  let discretionary_score = 5;
  if (discretionary_pct <= 20) discretionary_score = 20;
  else if (discretionary_pct <= 30) discretionary_score = 15;
  else if (discretionary_pct <= 40) discretionary_score = 10;

  // 4. Emergency Cushion Score (0 - 10 points)
  let emergency_score = 3;
  const net_surplus = Math.max(0, savings);
  if (net_surplus >= inc * 0.25) emergency_score = 10;
  else if (net_surplus >= inc * 0.1) emergency_score = 7;

  const total_score = Math.min(100, Math.max(0, Math.round(savings_score + budget_score + discretionary_score + emergency_score)));

  let tier = "Action Needed";
  let explanation = "Expenses are high relative to income. Review discretionary spending and stick to category budgets.";

  if (total_score >= 80) {
    tier = "Excellent Financial Health";
    explanation = "You have a strong savings rate and excellent spending control!";
  } else if (total_score >= 65) {
    tier = "Good Standing";
    explanation = "Solid financial balance. Slight optimization in discretionary spending can boost your savings.";
  } else if (total_score >= 50) {
    tier = "Fair Balance";
    explanation = "You are living close to your income limit. Reduce non-essential spending to improve safety margin.";
  }

  return {
    score: total_score,
    tier,
    explanation,
    breakdown: {
      savings_rate_score: savings_score,
      budget_compliance_score: budget_score,
      discretionary_control_score: discretionary_score,
      emergency_fund_score: emergency_score
    },
    is_educational_only: true
  };
}

function calculateBudgetAnalysis(expenses = [], budgetData = {}) {
  const total_budget = Number(budgetData.total_budget) || 32000;
  const category_budgets = budgetData.categories || {};
  const actual_spending = calculateCategorySpending(expenses);
  const total_spent = Object.values(actual_spending).reduce((a, b) => a + b, 0);

  const overall_usage_pct = total_budget > 0 ? (total_spent / total_budget) * 100 : 0;
  const remaining_budget = total_budget - total_spent;

  const category_details = [];
  const alerts = [];

  CATEGORIES.forEach(cat => {
    const limit = Number(category_budgets[cat]) || 0;
    const spent = actual_spending[cat] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;

    let status = "normal";
    if (spent > limit && limit > 0) {
      status = "exceeded";
      alerts.push(`Exceeded ${cat} budget! Spent ₹${spent.toLocaleString()} of ₹${limit.toLocaleString()} (${pct.toFixed(0)}% used).`);
    } else if (pct >= 90) {
      status = "warning_high";
      alerts.push(`${cat} budget is almost exhausted (${pct.toFixed(0)}% used).`);
    } else if (pct >= 70) {
      status = "warning_medium";
      alerts.push(`${cat} spending has reached ${pct.toFixed(0)}% of allocated limit.`);
    }

    category_details.push({
      category: cat,
      limit: round2(limit),
      spent: round2(spent),
      remaining: round2(limit - spent),
      percentage_used: round1(pct),
      status
    });
  });

  return {
    total_budget: round2(total_budget),
    total_spent: round2(total_spent),
    remaining_budget: round2(remaining_budget),
    overall_usage_percentage: round1(overall_usage_pct),
    category_details,
    alerts
  };
}

function calculateWhatIfScenario(income, currentExpenses = [], scenarioExpenses = {}) {
  const inc = Number(income) || 0;
  const currentCategoryTotals = calculateCategorySpending(currentExpenses);
  const currentTotalSpending = Object.values(currentCategoryTotals).reduce((a, b) => a + b, 0);
  const currentMonthlySavings = Math.max(0, inc - currentTotalSpending);

  const newTotalSpending = Object.values(scenarioExpenses).reduce((a, b) => a + (Number(b) || 0), 0);
  const newMonthlySavings = Math.max(0, inc - newTotalSpending);

  const monthlySavingsChange = newMonthlySavings - currentMonthlySavings;
  const annualSavingsChange = monthlySavingsChange * 12;
  const potentialAnnualSavings = newMonthlySavings * 12;

  return {
    current_monthly_spending: round2(currentTotalSpending),
    current_monthly_savings: round2(currentMonthlySavings),
    new_monthly_spending: round2(newTotalSpending),
    new_monthly_savings: round2(newMonthlySavings),
    monthly_delta: round2(monthlySavingsChange),
    annual_delta: round2(annualSavingsChange),
    potential_annual_savings: round2(potentialAnnualSavings)
  };
}

module.exports = {
  calculateSummary,
  calculateCategorySpending,
  calculateFinancialHealthScore,
  calculateBudgetAnalysis,
  calculateWhatIfScenario
};
