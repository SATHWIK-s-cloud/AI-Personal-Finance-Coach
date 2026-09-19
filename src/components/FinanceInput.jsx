import React, { useState } from 'react';
import { IndianRupee, Sparkles, RefreshCw } from 'lucide-react';

export default function FinanceInput({ income, expenses, onIncomeChange, onExpenseChange, onAnalyze }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeClick = () => {
    setIsAnalyzing(true);
    if (onAnalyze) onAnalyze();
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  const fields = [
    { key: 'rent', label: 'Rent', icon: '🏠' },
    { key: 'food', label: 'Food', icon: '🍲' },
    { key: 'transport', label: 'Transport', icon: '🚗' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { key: 'bills', label: 'Bills', icon: '⚡' },
    { key: 'other', label: 'Other', icon: '📦' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>💳</span> Your Monthly Finances
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your monthly earnings and expense breakdown in Indian Rupees (₹)
          </p>
        </div>
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm hover:shadow-indigo-200"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Analyze My Finances
            </>
          )}
        </button>
      </div>

      {/* Monthly Income Field */}
      <div className="mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
          Monthly Income (₹)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
            ₹
          </div>
          <input
            type="number"
            value={income === '' ? '' : income}
            onChange={(e) => onIncomeChange(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            placeholder="40000"
            min="0"
          />
        </div>
      </div>

      {/* Expense Inputs Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Monthly Expenses Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(({ key, label, icon }) => (
            <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>
                  {icon} {label}
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                  ₹
                </div>
                <input
                  type="number"
                  value={expenses[key] === '' ? '' : expenses[key]}
                  onChange={(e) => onExpenseChange(key, e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Analyze Button */}
      <div className="mt-6 pt-2 sm:hidden">
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-200"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Analyze My Finances
            </>
          )}
        </button>
      </div>
    </div>
  );
}
