import React, { useState } from 'react';
import { Sliders, TrendingUp, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { formatCurrency, calculateSummary } from '../utils/financialCalculators';

export default function WhatIfSimulator({ income, expenses }) {
  const [selectedCategory, setSelectedCategory] = useState('shopping');
  const initialCategorySpend = Number(expenses[selectedCategory]) || 0;
  const [simulatedSpend, setSimulatedSpend] = useState(initialCategorySpend);

  // Sync state if external category initial spend changes significantly and user hasn't touched slider
  const maxSliderValue = Math.max(20000, initialCategorySpend * 2);

  // Calculate current baseline metrics
  const currentSummary = calculateSummary(income, expenses);
  
  // Calculate simulated metrics
  const simulatedExpenses = {
    ...expenses,
    [selectedCategory]: Number(simulatedSpend) || 0,
  };
  const simulatedSummary = calculateSummary(income, simulatedExpenses);

  const monthlySavingsDelta = simulatedSummary.remainingSavings - currentSummary.remainingSavings;
  const potentialAnnualSavings = simulatedSummary.remainingSavings * 12;

  const categories = [
    { key: 'shopping', label: 'Shopping' },
    { key: 'entertainment', label: 'Entertainment' },
    { key: 'food', label: 'Food' },
    { key: 'other', label: 'Other' },
  ];

  const handleCategorySelect = (catKey) => {
    setSelectedCategory(catKey);
    setSimulatedSpend(Number(expenses[catKey]) || 0);
  };

  const setPreset = (percentage) => {
    const original = Number(expenses[selectedCategory]) || 0;
    setSimulatedSpend(Math.round(original * (1 - percentage)));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" /> What-If Simulator
          </h2>
          <p className="text-xs text-slate-500">
            See how changing your spending could affect your savings.
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          Interactive Scenario
        </span>
      </div>

      {/* Category selector chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategorySelect(cat.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label} ({formatCurrency(expenses[cat.key] || 0)})
          </button>
        ))}
      </div>

      {/* Slider Controls */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 capitalize">
            Simulated {selectedCategory} Expense
          </span>
          <span className="text-sm font-extrabold text-indigo-600">
            {formatCurrency(simulatedSpend)}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={maxSliderValue}
          step="500"
          value={simulatedSpend}
          onChange={(e) => setSimulatedSpend(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />

        {/* Quick Presets */}
        <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
          <span>₹0</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPreset(0.2)}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
            >
              -20%
            </button>
            <button
              onClick={() => setPreset(0.5)}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
            >
              -50%
            </button>
            <button
              onClick={() => setPreset(1.0)}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
            >
              Reset to 0
            </button>
          </div>
          <span>{formatCurrency(maxSliderValue)}</span>
        </div>
      </div>

      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Current Monthly Savings */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">
            Current Monthly Savings
          </span>
          <span className="text-base font-bold text-slate-700">
            {formatCurrency(currentSummary.remainingSavings)}
          </span>
        </div>

        {/* Potential Monthly Savings */}
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center relative overflow-hidden">
          <span className="text-[11px] font-semibold text-indigo-700 block mb-1">
            Potential Monthly Savings
          </span>
          <span className="text-lg font-extrabold text-indigo-900">
            {formatCurrency(simulatedSummary.remainingSavings)}
          </span>
          {monthlySavingsDelta !== 0 && (
            <span
              className={`text-[10px] font-bold block mt-0.5 ${
                monthlySavingsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {monthlySavingsDelta > 0 ? `+${formatCurrency(monthlySavingsDelta)}/mo` : `${formatCurrency(monthlySavingsDelta)}/mo`}
            </span>
          )}
        </div>

        {/* Potential Annual Savings */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[11px] font-semibold text-emerald-700 block mb-1 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> Potential Annual Savings
          </span>
          <span className="text-lg font-extrabold text-emerald-900">
            {formatCurrency(potentialAnnualSavings)}
          </span>
          <span className="text-[10px] font-medium text-emerald-700 block mt-0.5">
            Full 12-Month Projection
          </span>
        </div>

      </div>

    </div>
  );
}
