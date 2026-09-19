/**
 * Backend Ready API Service Layer
 * Switch USE_MOCK_API to false when connecting to a real REST API backend.
 */

import { generateAIInsights, calculateSummary } from '../utils/financialCalculators';

const USE_MOCK_API = true;
const API_BASE_URL = '/api';

/**
 * Fetch initial or saved dashboard financial data for a user
 */
export const getDashboardData = async (userId = 'default_user') => {
  if (USE_MOCK_API) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        income: 40000,
        expenses: {
          rent: 10000,
          food: 5000,
          transport: 3000,
          shopping: 5000,
          entertainment: 2000,
          bills: 3000,
          other: 2000,
        },
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    console.warn('Backend API unavailable, falling back to mock data:', err);
    return {
      success: true,
      data: {
        income: 40000,
        expenses: { rent: 10000, food: 5000, transport: 3000, shopping: 5000, entertainment: 2000, bills: 3000, other: 2000 },
      },
    };
  }
};

/**
 * Request AI insights based on current financial metrics
 */
export const getAIInsights = async (income, expenses) => {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      success: true,
      insights: generateAIInsights(income, expenses),
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income, expenses }),
    });
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (err) {
    return { success: true, insights: generateAIInsights(income, expenses) };
  }
};

/**
 * Calculate What-If scenario impact
 */
export const calculateWhatIf = async (currentIncome, currentExpenses, simulatedCategory, newAmount) => {
  const simulatedExpenses = {
    ...currentExpenses,
    [simulatedCategory]: Number(newAmount) || 0,
  };

  const currentMetrics = calculateSummary(currentIncome, currentExpenses);
  const newMetrics = calculateSummary(currentIncome, simulatedExpenses);

  const monthlyDiff = newMetrics.remainingSavings - currentMetrics.remainingSavings;
  const annualSavings = newMetrics.remainingSavings * 12;

  return {
    success: true,
    data: {
      currentMonthlySavings: currentMetrics.remainingSavings,
      potentialMonthlySavings: newMetrics.remainingSavings,
      monthlyDelta: monthlyDiff,
      potentialAnnualSavings: annualSavings,
    },
  };
};

/**
 * Send user message to AI Finance Coach
 * Endpoint mock: POST /api/chat
 */
export const sendChatMessage = async (userMessage, financialContext = {}) => {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // realistic bot thinking effect

    const query = userMessage.toLowerCase();
    const { income = 40000, expenses = {} } = financialContext;
    const summary = calculateSummary(income, expenses);

    let reply = '';

    if (query.includes('save') || query.includes('more money')) {
      reply = `Based on your current spending of ₹${summary.totalExpenses.toLocaleString('en-IN')}, reducing shopping (₹${(expenses.shopping || 0).toLocaleString('en-IN')}) and entertainment (₹${(expenses.entertainment || 0).toLocaleString('en-IN')}) could significantly boost your monthly savings from ₹${summary.remainingSavings.toLocaleString('en-IN')} to over ₹${(summary.remainingSavings + 3000).toLocaleString('en-IN')}.`;
    } else if (query.includes('rent') || query.includes('housing')) {
      const rentPercent = Math.round(((expenses.rent || 0) / (income || 1)) * 100);
      reply = `Your rent is ₹${(expenses.rent || 0).toLocaleString('en-IN')}, which accounts for ${rentPercent}% of your income. Financial experts generally recommend keeping housing costs below 30% of gross income. ${rentPercent <= 30 ? 'Your rent is in a safe range!' : 'Consider exploring ways to reduce housing expenses or split utility bills.'}`;
    } else if (query.includes('invest') || query.includes('where to put')) {
      reply = `With your current monthly savings of ₹${summary.remainingSavings.toLocaleString('en-IN')} (Savings Rate: ${summary.savingsRate}%), start by building a 3-to-6 month emergency buffer in a high-yield account, then consider systematic investment plans (SIPs) or low-cost index funds.`;
    } else if (query.includes('budget') || query.includes('50/30/20')) {
      reply = `Under the 50/30/20 rule for your ₹${income.toLocaleString('en-IN')} income:\n- 50% Needs: ₹${(income * 0.5).toLocaleString('en-IN')}\n- 30% Wants: ₹${(income * 0.3).toLocaleString('en-IN')}\n- 20% Savings: ₹${(income * 0.2).toLocaleString('en-IN')}.\nYou are currently saving ${summary.savingsRate}%!`;
    } else {
      reply = `I'm analyzing your finances (Income: ₹${income.toLocaleString('en-IN')}, Savings Rate: ${summary.savingsRate}%). Your highest single category is Rent at ₹${(expenses.rent || 0).toLocaleString('en-IN')}, followed by Shopping at ₹${(expenses.shopping || 0).toLocaleString('en-IN')}. Trimming discretionary spending will give you the fastest boost toward your financial goals!`;
    }

    return {
      success: true,
      message: reply,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, context: financialContext }),
    });
    if (!response.ok) throw new Error('Chat API error');
    return await response.json();
  } catch (err) {
    return {
      success: true,
      message: 'I apologize, but I am currently operating in offline mode. Based on your metrics, staying within budget will maximize your savings!',
      timestamp: new Date().toISOString(),
    };
  }
};
