/**
 * Full-Stack API Service Layer for AI Personal Finance Coach
 * Connects directly to FastAPI backend (http://localhost:8000/api)
 * with robust offline mock fallback for 100% demo availability.
 */

const API_BASE_URL = 'http://localhost:8000/api';

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Server request failed for ${url} (${err.message}). Using fallback handler.`);
    return null;
  }
}

// ----------------- INCOME API -----------------
export const apiGetIncome = async () => {
  const data = await safeFetch(`${API_BASE_URL}/income`);
  return data ? data.income : 40000;
};

export const apiSetIncome = async (amount) => {
  const data = await safeFetch(`${API_BASE_URL}/income`, {
    method: 'POST',
    body: JSON.stringify({ amount: Number(amount) }),
  });
  return data ? data.income : amount;
};

// ----------------- EXPENSE API -----------------
export const apiGetExpenses = async () => {
  const data = await safeFetch(`${API_BASE_URL}/expenses`);
  if (data && data.expenses) return data.expenses;
  
  // Default demo transaction items fallback
  return [
    // September 2026
    { id: 'exp-1', description: 'Apartment Rent', amount: 10000, category: 'Rent', date: '2026-09-01', is_recurring: true },
    { id: 'exp-2', description: 'Groceries & Vegetables', amount: 5000, category: 'Food', date: '2026-09-03', is_recurring: false },
    { id: 'exp-3', description: 'Monthly Metro Pass', amount: 3000, category: 'Transport', date: '2026-09-02', is_recurring: true },
    { id: 'exp-4', description: 'Amazon Clothing & Gadgets', amount: 5000, category: 'Shopping', date: '2026-09-05', is_recurring: false },
    { id: 'exp-5', description: 'Movie & Dining Out', amount: 2000, category: 'Entertainment', date: '2026-09-08', is_recurring: false },
    { id: 'exp-6', description: 'Electricity & Water Bill', amount: 3000, category: 'Bills', date: '2026-09-04', is_recurring: true },
    { id: 'exp-7', description: 'Netflix Subscription', amount: 500, category: 'Entertainment', date: '2026-09-01', is_recurring: true },
    { id: 'exp-8', description: 'Mobile Prepaid Recharge', amount: 1500, category: 'Bills', date: '2026-09-06', is_recurring: true },

    // August 2026
    { id: 'exp-9', description: 'Apartment Rent', amount: 10000, category: 'Rent', date: '2026-08-01', is_recurring: true },
    { id: 'exp-10', description: 'Supermarket Groceries', amount: 4500, category: 'Food', date: '2026-08-04', is_recurring: false },
    { id: 'exp-11', description: 'Monthly Metro Pass', amount: 3000, category: 'Transport', date: '2026-08-02', is_recurring: true },
    { id: 'exp-12', description: 'Electricity & Water Bill', amount: 2800, category: 'Bills', date: '2026-08-05', is_recurring: true },
    { id: 'exp-13', description: 'Netflix Subscription', amount: 500, category: 'Entertainment', date: '2026-08-01', is_recurring: true },
    { id: 'exp-14', description: 'Restaurant Weekend Dinner', amount: 2200, category: 'Food', date: '2026-08-14', is_recurring: false },

    // July 2026
    { id: 'exp-15', description: 'Apartment Rent', amount: 10000, category: 'Rent', date: '2026-07-01', is_recurring: true },
    { id: 'exp-16', description: 'Monthly Metro Pass', amount: 3000, category: 'Transport', date: '2026-07-02', is_recurring: true },
    { id: 'exp-17', description: 'Electricity & Water Bill', amount: 2500, category: 'Bills', date: '2026-07-04', is_recurring: true },
    { id: 'exp-18', description: 'Netflix Subscription', amount: 500, category: 'Entertainment', date: '2026-07-01', is_recurring: true },

    // October 2026
    { id: 'exp-19', description: 'Apartment Rent', amount: 10000, category: 'Rent', date: '2026-10-01', is_recurring: true },
    { id: 'exp-20', description: 'Festive Shopping & Electronics', amount: 8200, category: 'Shopping', date: '2026-10-05', is_recurring: false },
    { id: 'exp-21', description: 'Monthly Metro Pass', amount: 3000, category: 'Transport', date: '2026-10-02', is_recurring: true },
    { id: 'exp-22', description: 'Electricity & Water Bill', amount: 3200, category: 'Bills', date: '2026-10-04', is_recurring: true },
    { id: 'exp-23', description: 'Netflix Subscription', amount: 500, category: 'Entertainment', date: '2026-10-01', is_recurring: true },
    { id: 'exp-24', description: 'Organic Grocery Store', amount: 6300, category: 'Food', date: '2026-10-08', is_recurring: false },
  ];
};

export const apiAddExpense = async (expenseData) => {
  const data = await safeFetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
  if (data && data.expense) return data.expense;
  
  return {
    ...expenseData,
    id: `exp-${Date.now()}`,
    date: expenseData.date || new Date().toISOString().split('T')[0],
  };
};

export const apiUpdateExpense = async (id, updateData) => {
  const data = await safeFetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  if (data && data.expense) return data.expense;
  return { id, ...updateData };
};

export const apiDeleteExpense = async (id) => {
  const data = await safeFetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  return data ? true : true;
};

// ----------------- AUTO CATEGORIZATION API -----------------
export const apiCategorize = async (description) => {
  const data = await safeFetch(`${API_BASE_URL}/categorize`, {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
  if (data) return data;

  // Simple local fallback rule engine
  const text = (description || '').toLowerCase();
  let cat = 'Other';
  let is_rec = false;

  if (text.includes('amazon') || text.includes('shopping') || text.includes('clothes') || text.includes('flipkart')) cat = 'Shopping';
  else if (text.includes('netflix') || text.includes('movie') || text.includes('spotify') || text.includes('cinema')) cat = 'Entertainment';
  else if (text.includes('uber') || text.includes('ola') || text.includes('metro') || text.includes('petrol')) cat = 'Transport';
  else if (text.includes('electricity') || text.includes('water') || text.includes('bill') || text.includes('recharge')) cat = 'Bills';
  else if (text.includes('rent') || text.includes('apartment')) cat = 'Rent';
  else if (text.includes('zomato') || text.includes('swiggy') || text.includes('food') || text.includes('grocery')) cat = 'Food';

  if (text.includes('rent') || text.includes('netflix') || text.includes('subscription') || text.includes('bill') || text.includes('recharge')) {
    is_rec = true;
  }

  return { description, suggested_category: cat, confidence: 0.9, is_recurring: is_rec };
};

// ----------------- BUDGET API -----------------
export const apiGetBudget = async () => {
  const data = await safeFetch(`${API_BASE_URL}/budget`);
  if (data) return data;

  return {
    total_budget: 32000,
    total_spent: 30000,
    remaining_budget: 2000,
    overall_usage_percentage: 93.8,
    category_details: [
      { category: 'Rent', limit: 10000, spent: 10000, remaining: 0, percentage_used: 100, status: 'exceeded' },
      { category: 'Food', limit: 6000, spent: 5000, remaining: 1000, percentage_used: 83.3, status: 'warning_medium' },
      { category: 'Transport', limit: 3500, spent: 3000, remaining: 500, percentage_used: 85.7, status: 'warning_medium' },
      { category: 'Shopping', limit: 4000, spent: 5000, remaining: -1000, percentage_used: 125, status: 'exceeded' },
      { category: 'Entertainment', limit: 2500, spent: 2500, remaining: 0, percentage_used: 100, status: 'exceeded' },
      { category: 'Bills', limit: 4000, spent: 4500, remaining: -500, percentage_used: 112.5, status: 'exceeded' },
      { category: 'Other', limit: 2000, spent: 0, remaining: 2000, percentage_used: 0, status: 'normal' },
    ],
    alerts: [
      'Exceeded Shopping budget! Spent ₹5,000 of ₹4,000 (125% used).',
      'Food spending has reached 83% of allocated limit.',
    ],
  };
};

export const apiSetBudget = async (total_budget, category_limits) => {
  const data = await safeFetch(`${API_BASE_URL}/budget`, {
    method: 'POST',
    body: JSON.stringify({ total_budget, categories: category_limits }),
  });
  return data ? data.budget : null;
};

// ----------------- SAVINGS GOAL API -----------------
export const apiGetSavingsGoal = async () => {
  const data = await safeFetch(`${API_BASE_URL}/savings-goal`);
  if (data) return data;

  return {
    target_amount: 50000,
    target_date: '2027-03-31',
    current_savings: 15000,
    progress_percentage: 30.0,
    suggested_monthly_savings: 8000,
    current_actual_monthly_savings: 10000,
  };
};

export const apiSetSavingsGoal = async (goalData) => {
  const data = await safeFetch(`${API_BASE_URL}/savings-goal`, {
    method: 'POST',
    body: JSON.stringify(goalData),
  });
  return data ? data.savings_goal : goalData;
};

// ----------------- FINANCIAL HEALTH API -----------------
export const apiGetFinancialHealth = async () => {
  const data = await safeFetch(`${API_BASE_URL}/financial-health`);
  if (data) return data;

  return {
    score: 72,
    tier: 'Good Standing',
    explanation: 'Solid financial balance. Slight optimization in discretionary spending can boost your savings.',
    breakdown: {
      savings_rate_score: 30,
      "budget_compliance_score": 22,
      discretionary_control_score: 15,
      emergency_fund_score: 5,
    },
    is_educational_only: true,
  };
};

// ----------------- WHAT-IF API -----------------
export const apiRunWhatIf = async (scenarioExpenses) => {
  const data = await safeFetch(`${API_BASE_URL}/what-if`, {
    method: 'POST',
    body: JSON.stringify({ expenses: scenarioExpenses }),
  });
  return data;
};

// ----------------- CHAT API -----------------
export const apiSendChatMessage = async (userMessage, history = []) => {
  const data = await safeFetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message: userMessage, history }),
  });
  if (data && data.reply) return data.reply;

  // Fallback assistant reply
  const q = userMessage.toLowerCase();
  if (q.includes('save') || q.includes('10,000') || q.includes('10000')) {
    return "To save ₹10,000 monthly, consider capping Shopping and Entertainment to ₹3,000 total. You currently spend ₹7,000 on these combined!";
  } else if (q.includes('spend') || q.includes('most')) {
    return "Your highest spending category is Rent at ₹10,000, followed by Food and Shopping at ₹5,000 each.";
  } else if (q.includes('reduce') || q.includes('expenses')) {
    return "Review your recurring subscriptions (Netflix: ₹500, Mobile: ₹1,500) and trim discretionary dining out to instantly save over ₹2,500 monthly.";
  }
  return "I've analyzed your finances! Based on your current income of ₹40,000, keeping your discretionary spending under 20% will build a 6-month safety net efficiently.";
};

// ----------------- RESET DEMO DATA API -----------------
export const apiResetDemo = async () => {
  await safeFetch(`${API_BASE_URL}/reset-demo`, { method: 'POST' });
  return true;
};
