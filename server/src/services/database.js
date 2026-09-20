const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const INITIAL_DEMO_STATE = {
  income: 40000.0,
  expenses: [
    { id: "exp-1", description: "Apartment Rent", amount: 10000.0, category: "Rent", date: "2026-09-01", is_recurring: true },
    { id: "exp-2", description: "Groceries & Vegetables", amount: 5000.0, category: "Food", date: "2026-09-03", is_recurring: false },
    { id: "exp-3", description: "Monthly Metro Pass", amount: 3000.0, category: "Transport", date: "2026-09-02", is_recurring: true },
    { id: "exp-4", description: "Amazon Clothing & Gadgets", amount: 5000.0, category: "Shopping", date: "2026-09-05", is_recurring: false },
    { id: "exp-5", description: "Movie & Dining Out", amount: 2000.0, category: "Entertainment", date: "2026-09-08", is_recurring: false },
    { id: "exp-6", description: "Electricity & Water Bill", amount: 3000.0, category: "Bills", date: "2026-09-04", is_recurring: true },
    { id: "exp-7", description: "Netflix Subscription", amount: 500.0, category: "Entertainment", date: "2026-09-01", is_recurring: true },
    { id: "exp-8", description: "Mobile Prepaid Recharge", amount: 1500.0, category: "Bills", date: "2026-09-06", is_recurring: true }
  ],
  previous_month_expenses: {
    Rent: 10000.0,
    Food: 4500.0,
    Transport: 2800.0,
    Shopping: 3500.0,
    Entertainment: 1800.0,
    Bills: 2700.0,
    Other: 1000.0
  },
  budget: {
    total_budget: 32000.0,
    categories: {
      Rent: 10000.0,
      Food: 6000.0,
      Transport: 3500.0,
      Shopping: 4000.0,
      Entertainment: 2500.0,
      Bills: 4000.0,
      Other: 2000.0
    }
  },
  savings_goal: {
    target_amount: 50000.0,
    target_date: "2027-03-31",
    current_savings: 15000.0
  }
};

let supabase = null;
let useSupabase = false;

if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project-id')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    useSupabase = true;
    console.log('[Database] Supabase PostgreSQL client initialized.');
  } catch (err) {
    console.warn(`[Database] Supabase initialization failed (${err.message}). Using resilient In-Memory store.`);
    useSupabase = false;
  }
} else {
  console.log('[Database] Supabase URL/KEY unconfigured. Running in resilient In-Memory demo store mode.');
}

// Deep clone of initial demo state
let inMemoryData = JSON.parse(JSON.stringify(INITIAL_DEMO_STATE));

async function getIncome() {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('income').select('*').eq('id', 'current_income').single();
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[Supabase] No income row found, returning default demo income.');
        return inMemoryData.income;
      }
      console.error('[Supabase Error] getIncome failed:', error);
      throw new Error(`Supabase getIncome error: ${error.message || JSON.stringify(error)}`);
    }
    if (data) return Number(data.amount);
  }
  return inMemoryData.income;
}

async function setIncome(amount) {
  const numericAmount = Number(amount);
  if (useSupabase && supabase) {
    const { error } = await supabase.from('income').upsert({ id: 'current_income', amount: numericAmount });
    if (error) {
      console.error('[Supabase Error] setIncome failed:', error);
      throw new Error(`Supabase setIncome error: ${error.message || JSON.stringify(error)}`);
    }
  }
  inMemoryData.income = numericAmount;
  return numericAmount;
}

async function getExpenses() {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('expenses').select('*');
    if (error) {
      console.error('[Supabase Error] getExpenses failed:', error);
      throw new Error(`Supabase getExpenses error: ${error.message || JSON.stringify(error)}`);
    }
    return data || [];
  }
  return inMemoryData.expenses;
}

async function addExpense(expenseData) {
  const id = expenseData.id || `exp-${Math.random().toString(36).substr(2, 6)}`;
  const payload = {
    id,
    description: expenseData.description || 'Expense',
    amount: Number(expenseData.amount) || 0,
    category: expenseData.category || 'Other',
    date: expenseData.date || new Date().toISOString().split('T')[0],
    is_recurring: Boolean(expenseData.is_recurring)
  };

  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('expenses').insert(payload).select().single();
    if (error) {
      console.error('[Supabase Error] addExpense failed:', error);
      throw new Error(`Supabase addExpense error: ${error.message || JSON.stringify(error)}`);
    }
    if (data) {
      inMemoryData.expenses.push(data);
      return data;
    }
  }

  inMemoryData.expenses.push(payload);
  return payload;
}

async function updateExpense(id, updateData) {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('expenses').update(updateData).eq('id', id).select().single();
    if (error) {
      console.error('[Supabase Error] updateExpense failed:', error);
      throw new Error(`Supabase updateExpense error: ${error.message || JSON.stringify(error)}`);
    }
    return data;
  }

  const idx = inMemoryData.expenses.findIndex(e => e.id === id);
  if (idx !== -1) {
    inMemoryData.expenses[idx] = { ...inMemoryData.expenses[idx], ...updateData };
    return inMemoryData.expenses[idx];
  }
  return null;
}

async function deleteExpense(id) {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error('[Supabase Error] deleteExpense failed:', error);
      throw new Error(`Supabase deleteExpense error: ${error.message || JSON.stringify(error)}`);
    }
    return true;
  }

  const prevLen = inMemoryData.expenses.length;
  inMemoryData.expenses = inMemoryData.expenses.filter(e => e.id !== id);
  return inMemoryData.expenses.length < prevLen;
}

async function getBudget() {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('budget').select('*').eq('id', 'current_budget').single();
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[Supabase] No budget row found, returning default demo budget.');
        return inMemoryData.budget;
      }
      console.error('[Supabase Error] getBudget failed:', error);
      throw new Error(`Supabase getBudget error: ${error.message || JSON.stringify(error)}`);
    }
    if (data) {
      return {
        total_budget: Number(data.total_budget),
        categories: data.categories || {}
      };
    }
  }
  return inMemoryData.budget;
}

async function setBudget(budgetData) {
  const payload = {
    id: 'current_budget',
    total_budget: Number(budgetData.total_budget) || 32000,
    categories: budgetData.categories || {}
  };

  if (useSupabase && supabase) {
    const { error } = await supabase.from('budget').upsert(payload);
    if (error) {
      console.error('[Supabase Error] setBudget failed:', error);
      throw new Error(`Supabase setBudget error: ${error.message || JSON.stringify(error)}`);
    }
  }

  inMemoryData.budget = {
    total_budget: payload.total_budget,
    categories: payload.categories
  };
  return inMemoryData.budget;
}

async function getSavingsGoal() {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('savings_goal').select('*').eq('id', 'current_savings_goal').single();
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[Supabase] No savings_goal row found, returning default demo savings goal.');
        return inMemoryData.savings_goal;
      }
      console.error('[Supabase Error] getSavingsGoal failed:', error);
      throw new Error(`Supabase getSavingsGoal error: ${error.message || JSON.stringify(error)}`);
    }
    if (data) {
      return {
        target_amount: Number(data.target_amount),
        target_date: data.target_date,
        current_savings: Number(data.current_savings)
      };
    }
  }
  return inMemoryData.savings_goal;
}

async function setSavingsGoal(goalData) {
  const payload = {
    id: 'current_savings_goal',
    target_amount: Number(goalData.target_amount) || 50000,
    target_date: goalData.target_date || '2027-03-31',
    current_savings: Number(goalData.current_savings) || 0
  };

  if (useSupabase && supabase) {
    const { error } = await supabase.from('savings_goal').upsert(payload);
    if (error) {
      console.error('[Supabase Error] setSavingsGoal failed:', error);
      throw new Error(`Supabase setSavingsGoal error: ${error.message || JSON.stringify(error)}`);
    }
  }

  inMemoryData.savings_goal = {
    target_amount: payload.target_amount,
    target_date: payload.target_date,
    current_savings: payload.current_savings
  };
  return inMemoryData.savings_goal;
}

async function resetDemoData() {
  inMemoryData = JSON.parse(JSON.stringify(INITIAL_DEMO_STATE));
  if (useSupabase && supabase) {
    try {
      await supabase.from('income').delete().neq('id', '');
      await supabase.from('expenses').delete().neq('id', '');
      await supabase.from('budget').delete().neq('id', '');
      await supabase.from('savings_goal').delete().neq('id', '');

      await supabase.from('income').insert({ id: 'current_income', amount: INITIAL_DEMO_STATE.income });
      await supabase.from('expenses').insert(INITIAL_DEMO_STATE.expenses);
      await supabase.from('budget').insert({ id: 'current_budget', ...INITIAL_DEMO_STATE.budget });
      await supabase.from('savings_goal').insert({ id: 'current_savings_goal', ...INITIAL_DEMO_STATE.savings_goal });
    } catch (e) {
      console.error(`[Supabase Error] resetDemoData error: ${e.message}`);
    }
  }
  return true;
}

function getPreviousMonthTotals() {
  return inMemoryData.previous_month_expenses;
}

module.exports = {
  getIncome,
  setIncome,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudget,
  setBudget,
  getSavingsGoal,
  setSavingsGoal,
  resetDemoData,
  getPreviousMonthTotals,
  useSupabase: () => useSupabase
};
