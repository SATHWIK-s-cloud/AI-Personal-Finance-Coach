import React, { useState } from 'react';
import { Target, AlertTriangle, AlertCircle, CheckCircle2, TrendingUp, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculators';

const CATEGORIES = ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"];

export default function BudgetAndSavings({
  income,
  totalExpenses,
  expensesByCategory,
  budget,
  onSaveBudget,
  savingsGoal,
  onSaveSavingsGoal
}) {
  const totalBudget = budget.total_budget || 32000;
  const categoryLimits = budget.categories || {
    Rent: 10000,
    Food: 6000,
    Transport: 3500,
    Shopping: 4000,
    Entertainment: 2500,
    Bills: 4000,
    Other: 2000,
  };

  // Editable local states
  const [editTotalBudget, setEditTotalBudget] = useState(totalBudget);
  const [editCategoryLimits, setEditCategoryLimits] = useState(categoryLimits);

  // Goal editable local states
  const [targetAmount, setTargetAmount] = useState(savingsGoal.target_amount || 50000);
  const [targetDate, setTargetDate] = useState(savingsGoal.target_date || '2027-03-31');
  const [currentSavings, setCurrentSavings] = useState(savingsGoal.current_savings || 15000);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const handleCategoryLimitChange = (cat, val) => {
    const num = val === '' ? 0 : Number(val);
    const updated = { ...editCategoryLimits, [cat]: num };
    setEditCategoryLimits(updated);
    const newTotal = Object.values(updated).reduce((sum, v) => sum + v, 0);
    setEditTotalBudget(newTotal);
  };

  const handleBudgetSave = () => {
    onSaveBudget(editTotalBudget, editCategoryLimits);
    setSavedSuccessMsg('Budget limits updated successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleGoalSave = () => {
    onSaveSavingsGoal({
      target_amount: Number(targetAmount),
      target_date: targetDate,
      current_savings: Number(currentSavings),
    });
    setSavedSuccessMsg('Savings goal updated successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  // Calculations
  const overallUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
  const remainingBudget = totalBudget - totalExpenses;

  // Suggested monthly savings calculation: Income - totalBudget
  const suggestedMonthlySavings = Math.max(0, income - totalBudget);

  // Savings progress calculation
  const goalTarget = Number(targetAmount) || 1;
  const goalProgressPct = Math.min(100, Math.round((currentSavings / goalTarget) * 100));
  const remainingGoalAmt = Math.max(0, goalTarget - currentSavings);

  // Calculate required monthly savings based on target date
  const monthsRemaining = 6; // defaulted for hackathon display context
  const requiredMonthlySavings = Math.round(remainingGoalAmt / monthsRemaining);

  return (
    <div className="space-y-6">

      {/* Success Banner */}
      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* 1. Monthly Budget Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" /> Monthly Budget Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Member 3 Module • Set category budgets and receive instant usage warnings
            </p>
          </div>

          <button
            onClick={handleBudgetSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
          >
            Save Budget Limits
          </button>
        </div>

        {/* Budget Progress Bar & Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Budget</span>
            <div className="text-lg font-extrabold text-slate-900 mt-1">{formatCurrency(totalBudget)}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount Spent</span>
            <div className="text-lg font-extrabold text-indigo-600 mt-1">{formatCurrency(totalExpenses)}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Remaining Budget</span>
            <div className={`text-lg font-extrabold mt-1 ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(remainingBudget)}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overall Usage</span>
            <div className={`text-lg font-extrabold mt-1 ${overallUsedPct >= 90 ? 'text-red-600' : overallUsedPct >= 70 ? 'text-amber-600' : 'text-slate-900'}`}>
              {overallUsedPct}%
            </div>
          </div>

        </div>

        {/* Overall Progress Meter */}
        <div className="space-y-1.5 mb-8">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-700">Overall Budget Utilization</span>
            <span className={overallUsedPct >= 100 ? 'text-red-600' : overallUsedPct >= 90 ? 'text-amber-600' : 'text-slate-700'}>
              {overallUsedPct}% Used
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                overallUsedPct >= 100 ? 'bg-red-500' : overallUsedPct >= 90 ? 'bg-amber-500' : overallUsedPct >= 70 ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallUsedPct)}%` }}
            />
          </div>
        </div>

        {/* Category Budget Limits Grid */}
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Category-Wise Budgets & Live Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const limit = editCategoryLimits[cat] || 0;
            const spent = expensesByCategory[cat] || 0;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

            let badgeStyle = "bg-slate-100 text-slate-700";
            let alertMsg = null;

            if (spent > limit && limit > 0) {
              badgeStyle = "bg-red-100 text-red-800 border-red-200";
              alertMsg = `Exceeded! You spent ${formatCurrency(spent)} of ${formatCurrency(limit)} limit.`;
            } else if (pct >= 90) {
              badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
              alertMsg = `${cat} budget is almost exhausted (${pct}% used).`;
            } else if (pct >= 70) {
              badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
              alertMsg = `${cat} spending reached ${pct}% of limit.`;
            }

            return (
              <div key={cat} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{cat}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                    {pct}% Used
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase">Limit (₹)</label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase">Spent (₹)</label>
                    <div className="py-1.5 font-bold text-xs text-slate-800">{formatCurrency(spent)}</div>
                  </div>
                </div>

                {alertMsg && (
                  <div className="text-[11px] font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{alertMsg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Savings Goal & Calculator Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Savings Goal & Planner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set target goals and track suggested monthly savings amount
            </p>
          </div>

          <button
            onClick={handleGoalSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
          >
            Update Goal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Goal Input Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Savings Goal (₹)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Savings Accumulated (₹)</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="15000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Savings Progress Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30 inline-block mb-3">
                Live Progress Tracker
              </span>

              <h3 className="text-xl font-extrabold tracking-tight">
                Goal: Save {formatCurrency(goalTarget)}
              </h3>
              <p className="text-xs text-indigo-200 mt-1">
                Target Date: {targetDate}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 my-5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-indigo-200">Progress</span>
                  <span className="text-white font-bold">{goalProgressPct}% Completed</span>
                </div>
                <div className="w-full h-3 bg-indigo-950/60 rounded-full overflow-hidden border border-indigo-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-indigo-300 transition-all duration-500"
                    style={{ width: `${goalProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-700/50 text-xs">
              <div>
                <span className="text-[11px] text-indigo-300">Suggested Savings/mo</span>
                <div className="text-base font-bold text-emerald-300 mt-0.5">
                  {formatCurrency(suggestedMonthlySavings)}
                </div>
                <p className="text-[10px] text-indigo-200/70">Based on Income - Budget</p>
              </div>

              <div>
                <span className="text-[11px] text-indigo-300">Required Monthly Savings</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {formatCurrency(requiredMonthlySavings)}
                </div>
                <p className="text-[10px] text-indigo-200/70">To hit target date</p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
