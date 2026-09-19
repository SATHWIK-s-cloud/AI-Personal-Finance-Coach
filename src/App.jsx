import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import FinanceInput from './components/FinanceInput';
import SummaryCards from './components/SummaryCards';
import HealthScore from './components/HealthScore';
import SpendingChart from './components/SpendingChart';
import AIInsights from './components/AIInsights';
import WhatIfSimulator from './components/WhatIfSimulator';
import FinanceChat from './components/FinanceChat';

import {
  calculateSummary,
  calculateHealthScore,
  generateAIInsights,
} from './utils/financialCalculators';

export default function App() {
  // Central Financial State with Hackathon Default Demo Values
  const [income, setIncome] = useState(40000);
  const [expenses, setExpenses] = useState({
    rent: 10000,
    food: 5000,
    transport: 3000,
    shopping: 5000,
    entertainment: 2000,
    bills: 3000,
    other: 2000,
  });

  const [analyzePulse, setAnalyzePulse] = useState(false);

  // Handlers
  const handleIncomeChange = (val) => {
    setIncome(val === '' ? '' : Number(val));
  };

  const handleExpenseChange = (key, val) => {
    setExpenses((prev) => ({
      ...prev,
      [key]: val === '' ? '' : Number(val),
    }));
  };

  const handleAnalyze = () => {
    setAnalyzePulse(true);
    setTimeout(() => setAnalyzePulse(false), 600);
  };

  // Dynamic Calculated Metrics (Memoized for optimal performance)
  const summary = useMemo(() => calculateSummary(income, expenses), [income, expenses]);
  const healthScore = useMemo(() => calculateHealthScore(income, expenses), [income, expenses]);
  const aiInsights = useMemo(() => generateAIInsights(income, expenses), [income, expenses]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Header />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Quick Welcome & Context Header */}
        <section id="overview" className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full inline-block mb-3">
              Hackathon MVP • Financial Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Master Your Money with AI Coaching
            </h1>
            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
              Real-time deterministic calculation meets personalized AI guidance. Edit your monthly finances below to trigger live recalculations of your health score, spending breakdown, scenario simulator, and AI insights.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none"></div>
        </section>

        {/* Section 2: Summary Cards */}
        <section className={`transition-all ${analyzePulse ? 'scale-[0.99] opacity-90' : ''}`}>
          <SummaryCards
            income={summary.income}
            totalExpenses={summary.totalExpenses}
            remainingSavings={summary.remainingSavings}
            savingsRate={summary.savingsRate}
          />
        </section>

        {/* Section 1 & Section 3: Financial Inputs & Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7">
            <FinanceInput
              income={income}
              expenses={expenses}
              onIncomeChange={handleIncomeChange}
              onExpenseChange={handleExpenseChange}
              onAnalyze={handleAnalyze}
            />
          </section>

          <section className="lg:col-span-5">
            <HealthScore score={healthScore} />
          </section>
        </div>

        {/* Section 4 & Section 5: Spending Breakdown & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="breakdown">
          <section className="lg:col-span-6" id="insights">
            <SpendingChart expenses={expenses} />
          </section>

          <section className="lg:col-span-6">
            <AIInsights insights={aiInsights} />
          </section>
        </div>

        {/* Section 6 & Section 7: What-If Simulator & AI Coach Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="simulator">
          <section className="lg:col-span-6">
            <WhatIfSimulator income={income} expenses={expenses} />
          </section>

          <section className="lg:col-span-6" id="chat">
            <FinanceChat income={income} expenses={expenses} />
          </section>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            AI Personal Finance Coach — Hackathon MVP Frontend
          </p>
          <p>
            Designed for 24-Hour Hackathon Presentation • React + Vite + Tailwind CSS + Recharts
          </p>
        </div>
      </footer>
    </div>
  );
}
