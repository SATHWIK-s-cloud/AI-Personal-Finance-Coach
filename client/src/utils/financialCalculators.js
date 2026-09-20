/**
 * Financial Calculators and Recommendation Utilities
 */

// Format numbers as Indian Rupee (₹)
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate basic summary metrics
export const calculateSummary = (income, expenses) => {
  const numericIncome = Number(income) || 0;
  const totalExpenses = Object.values(expenses).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const remainingSavings = numericIncome - totalExpenses;
  const savingsRate =
    numericIncome > 0
      ? Math.max(0, Math.round((remainingSavings / numericIncome) * 100))
      : 0;

  return {
    income: numericIncome,
    totalExpenses,
    remainingSavings,
    savingsRate,
  };
};

// Application-defined Financial Health Score (0 - 100)
export const calculateHealthScore = (income, expenses) => {
  const { totalExpenses, savingsRate } = calculateSummary(income, expenses);
  if (income <= 0) return 0;

  // 1. Savings Rate Component (Max 50 points)
  // Target: >= 30% savings rate gives full 50 pts
  let savingsPoints = Math.min(50, (savingsRate / 30) * 50);

  // 2. Expense Ratio Component (Max 30 points)
  // Target: Expenses <= 50% gives full 30 pts, > 90% gives 0 pts
  const expenseRatio = totalExpenses / income;
  let expensePoints = 0;
  if (expenseRatio <= 0.5) {
    expensePoints = 30;
  } else if (expenseRatio < 1.0) {
    expensePoints = 30 * (1 - (expenseRatio - 0.5) / 0.5);
  }

  // 3. Essential vs Discretionary Ratio (Max 20 points)
  // Essential: Rent, Food, Transport, Bills
  // Discretionary: Shopping, Entertainment, Other
  const essential =
    (Number(expenses.rent) || 0) +
    (Number(expenses.food) || 0) +
    (Number(expenses.transport) || 0) +
    (Number(expenses.bills) || 0);
  const discretionary =
    (Number(expenses.shopping) || 0) +
    (Number(expenses.entertainment) || 0) +
    (Number(expenses.other) || 0);

  let bufferPoints = 20;
  if (discretionary > essential && totalExpenses > 0) {
    bufferPoints = Math.max(5, 20 - Math.round((discretionary / totalExpenses) * 20));
  }

  const finalScore = Math.min(
    100,
    Math.max(10, Math.round(savingsPoints + expensePoints + bufferPoints))
  );

  return finalScore;
};

// Generate dynamic AI insights based on financial numbers
export const generateAIInsights = (income, expenses) => {
  const { remainingSavings, savingsRate, totalExpenses } = calculateSummary(
    income,
    expenses
  );

  const insights = [];

  // Identify top discretionary expense category
  const categories = [
    { name: 'Shopping', amount: Number(expenses.shopping) || 0, isDiscretionary: true },
    { name: 'Entertainment', amount: Number(expenses.entertainment) || 0, isDiscretionary: true },
    { name: 'Food', amount: Number(expenses.food) || 0, isDiscretionary: false },
    { name: 'Rent', amount: Number(expenses.rent) || 0, isDiscretionary: false },
    { name: 'Transport', amount: Number(expenses.transport) || 0, isDiscretionary: false },
    { name: 'Bills', amount: Number(expenses.bills) || 0, isDiscretionary: false },
    { name: 'Other', amount: Number(expenses.other) || 0, isDiscretionary: true },
  ];

  // Sort by amount descending
  categories.sort((a, b) => b.amount - a.amount);
  const topExpense = categories[0];
  const topDiscretionary = categories.find((c) => c.isDiscretionary) || categories[0];

  // Insight 1: Discretionary spend highlight
  if (topDiscretionary && topDiscretionary.amount > 0) {
    insights.push({
      type: 'warning',
      text: `${topDiscretionary.name} is one of your highest discretionary expenses (${formatCurrency(topDiscretionary.amount)}/month).`,
    });
  } else {
    insights.push({
      type: 'info',
      text: 'Your discretionary spending appears low and well-controlled.',
    });
  }

  // Insight 2: Savings improvement potential
  if (topDiscretionary && topDiscretionary.amount > 0) {
    const savingsBoost = Math.round(topDiscretionary.amount * 0.4);
    insights.push({
      type: 'action',
      text: `You could potentially increase monthly savings by ${formatCurrency(savingsBoost)} by reducing ${topDiscretionary.name.toLowerCase()} expenses.`,
    });
  } else {
    insights.push({
      type: 'action',
      text: 'Consider allocating a fixed portion of your income directly to an automated savings fund each month.',
    });
  }

  // Insight 3: Current Savings Rate analysis
  if (savingsRate >= 30) {
    insights.push({
      type: 'positive',
      text: `Great job! Your current savings rate is ${savingsRate}%, exceeding the recommended 20% benchmark.`,
    });
  } else if (savingsRate >= 15) {
    insights.push({
      type: 'info',
      text: `Your current savings rate is ${savingsRate}%. Scaling it to 25% could build your emergency fund faster.`,
    });
  } else if (savingsRate > 0) {
    insights.push({
      type: 'alert',
      text: `Your current savings rate is ${savingsRate}%. This is below the recommended 20% benchmark for long-term health.`,
    });
  } else {
    insights.push({
      type: 'alert',
      text: `Your total expenses equal or exceed your income. Urgent budget rebalancing is recommended.`,
    });
  }

  // Insight 4: Recommended spending cap rule
  const rule503020DiscretionaryCap = Math.round(income * 0.3);
  insights.push({
    type: 'tip',
    text: `Following the 50/30/20 budgeting rule, consider setting a monthly cap of ${formatCurrency(rule503020DiscretionaryCap)} for all discretionary wants.`,
  });

  return insights;
};
