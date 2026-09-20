import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import HealthScore from './components/HealthScore';
import FinanceInput from './components/FinanceInput';
import TransactionHistory from './components/TransactionHistory';
import BudgetAndSavings from './components/BudgetAndSavings';
import SpendingChart from './components/SpendingChart';
import AIInsights from './components/AIInsights';
import WhatIfSimulator from './components/WhatIfSimulator';
import FinanceChat from './components/FinanceChat';
import AuthPage from './components/AuthPage';
import MonthlyExpenseAnalysis from './components/MonthlyExpenseAnalysis';
import RecurringExpenses from './components/RecurringExpenses';

import {
  apiGetIncome, apiSetIncome,
  apiGetExpenses, apiAddExpense, apiUpdateExpense, apiDeleteExpense,
  apiGetBudget, apiSetBudget,
  apiGetSavingsGoal, apiSetSavingsGoal,
  apiResetDemo, DEFAULT_DEMO_EXPENSES
} from './services/api';

import { calculateSummary, calculateHealthScore, generateAIInsights } from './utils/financialCalculators';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Authentication state initialized from localStorage session
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ai_finance_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('ai_finance_user');
    setUser(null);
  };

  // Core Application Data State - Pre-populated with rich hackathon demo data
  const [income, setIncome] = useState(0);
  const [expensesList, setExpensesList] = useState(DEFAULT_DEMO_EXPENSES);

  const [budgetData, setBudgetData] = useState({
    total_budget: 0,
    categories: {
      rent: 0,
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      other: 0,
    },
  });

  const [savingsGoal, setSavingsGoal] = useState({
    target_amount: 0,
    target_date: '2027-03-31',
    current_savings: 0,
  });

  // Load state from REST backend on mount (merging live database records if present)
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [inc, exps, bud, goal] = await Promise.all([
        apiGetIncome(),
        apiGetExpenses(),
        apiGetBudget(),
        apiGetSavingsGoal(),
      ]);

      if (inc !== null && typeof inc === 'number') setIncome(inc);
      if (exps && Array.isArray(exps) && exps.length > 0) {
        setExpensesList(exps);
      }
      if (bud && bud.category_details) {
        const catMap = {};
        bud.category_details.forEach(c => { catMap[c.category] = c.limit; });
        setBudgetData({ total_budget: bud.total_budget, categories: catMap });
      } else if (bud && bud.categories) {
        setBudgetData({ total_budget: bud.total_budget || 32000, categories: bud.categories });
      }
      if (goal && goal.target_amount) setSavingsGoal(goal);
    } catch (err) {
      console.warn('[App] Rest data sync notice:', err.message);
    } fontally: {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute category breakdown from transactions list
  const categoryTotals = useMemo(() => {
    const totals = { Rent: 0, Food: 0, Transport: 0, Shopping: 0, Entertainment: 0, Bills: 0, Other: 0 };
    expensesList.forEach((exp) => {
      const rawCat = (exp.category || 'Other').trim();
      const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
      if (totals[cat] !== undefined) {
        totals[cat] += Number(exp.amount) || 0;
      } else {
        totals.Other += Number(exp.amount) || 0;
      }
    });
    return totals;
  }, [expensesList]);

  // Compute total expenses
  const totalExpenses = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  }, [categoryTotals]);

  // Summary Metrics
  const summary = useMemo(() => {
    const remainingSavings = Math.max(0, income - totalExpenses);
    const savingsRate = income > 0 ? Math.round((remainingSavings / income) * 100) : 0;
    return {
      income,
      totalExpenses,
      remainingSavings,
      savingsRate,
    };
  }, [income, totalExpenses]);

  // Financial Health Score
  const healthScore = useMemo(() => {
    return calculateHealthScore(income, categoryTotals);
  }, [income, categoryTotals]);

  // AI Insights
  const aiInsights = useMemo(() => {
    return generateAIInsights(income, categoryTotals);
  }, [income, categoryTotals]);

  // Handlers for REST sync
  const handleIncomeChange = async (newVal) => {
    const num = newVal === '' ? 0 : Number(newVal);
    setIncome(num);
    await apiSetIncome(num);
  };

  const handleExpenseCategoryChange = (key, val) => {
    const catName = key.charAt(0).toUpperCase() + key.slice(1);
    const num = val === '' ? 0 : Number(val);

    setExpensesList((prev) => {
      const existingIdx = prev.findIndex((e) => e.category.toLowerCase() === key.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], amount: num };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `exp-${Date.now()}`,
            description: `${catName} Expense`,
            amount: num,
            category: catName,
            date: new Date().toISOString().split('T')[0],
            is_recurring: false,
          },
        ];
      }
    });
  };

  const handleAddExpense = async (newExp) => {
    const added = await apiAddExpense(newExp);
    setExpensesList((prev) => [added, ...prev]);
  };

  const handleUpdateExpense = async (id, updatedData) => {
    const updated = await apiUpdateExpense(id, updatedData);
    setExpensesList((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const handleDeleteExpense = async (id) => {
    await apiDeleteExpense(id);
    setExpensesList((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Budget & Savings Goal
  const handleSaveBudget = async (total, limits) => {
    setBudgetData({ total_budget: total, categories: limits });
    await apiSetBudget(total, limits);
  };

  const handleSaveSavingsGoal = async (goal) => {
    setSavingsGoal(goal);
    await apiSetSavingsGoal(goal);
  };

  // Handle Reset Demo Data
  const handleResetDemoData = async () => {
    setIsResetting(true);
    await apiResetDemo();
    await fetchAllData();
    setIsResetting(false);
  };

  // Render Login/Sign-up page if user is not authenticated
  if (!user) {
    return <AuthPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white text-slate-900">

      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemoData}
        isResetting={isResetting}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full inline-block mb-3">
              24-Hour Hackathon MVP • Single Integrated Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Personal Finance Coach
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Unified financial dashboard connecting Expense & Income Tracking, AI Pattern Detection, Budget & Savings Management, Visual Analytics, What-If Simulation, and AI Chatbot.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
        </section>

        {/* Global Summary Cards Header */}
        <section>
          <SummaryCards
            income={summary.income}
            totalExpenses={summary.totalExpenses}
            remainingSavings={summary.remainingSavings}
            savingsRate={summary.savingsRate}
          />
        </section>

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* Quick Edit Finances & Health Score Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-7">
                <FinanceInput
                  income={income}
                  expenses={categoryTotals}
                  onIncomeChange={handleIncomeChange}
                  onExpenseChange={handleExpenseCategoryChange}
                  onAnalyze={() => { }}
                />
              </section>

              <section className="lg:col-span-5">
                <HealthScore score={healthScore} />
              </section>
            </div>

            {/* Dynamic Calendar & Monthly Expense Analysis */}
            <section>
              <MonthlyExpenseAnalysis expensesList={expensesList} />
            </section>

            {/* Recurring / Repetitive Expenses */}
            <section>
              <RecurringExpenses expensesList={expensesList} />
            </section>

            {/* Visualizations & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-6">
                <SpendingChart expenses={categoryTotals} budgetLimits={budgetData.categories} />
              </section>

              <section className="lg:col-span-6">
                <AIInsights insights={aiInsights} />
              </section>
            </div>

            {/* What-If Simulator & AI Chat Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-6">
                <WhatIfSimulator income={income} expenses={categoryTotals} />
              </section>

              <section className="lg:col-span-6">
                <FinanceChat income={income} expenses={categoryTotals} />
              </section>
            </div>

          </div>
        )}

        {/* TAB 2: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <TransactionHistory
            income={income}
            onIncomeChange={handleIncomeChange}
            expensesList={expensesList}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {/* TAB 3: BUDGET & SAVINGS */}
        {activeTab === 'budget' && (
          <BudgetAndSavings
            income={income}
            totalExpenses={totalExpenses}
            expensesByCategory={categoryTotals}
            budget={budgetData}
            onSaveBudget={handleSaveBudget}
            savingsGoal={savingsGoal}
            onSaveSavingsGoal={handleSaveSavingsGoal}
          />
        )}

        {/* TAB 4: AI INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7">
              <AIInsights insights={aiInsights} />
            </section>
            <section className="lg:col-span-5">
              <HealthScore score={healthScore} />
            </section>
          </div>
        )}

        {/* TAB 5: AI CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <FinanceChat income={income} expenses={categoryTotals} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            AI Personal Finance Coach — Full-Stack Integration
          </p>
          <p>
            React + Vite + Node.js + Express + Supabase PostgreSQL
          </p>
        </div>
      </footer>

    </div>
  );
}
