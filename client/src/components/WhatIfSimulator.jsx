import React, { useState } from 'react';
import { Sliders, Calendar, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency, calculateSummary } from '../utils/financialCalculators';

const CATEGORIES = [
  { key: 'Shopping', label: 'Shopping' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Food', label: 'Food' },
  { key: 'Transport', label: 'Transport' },
  { key: 'Rent', label: 'Rent' },
  { key: 'Bills', label: 'Bills' },
  { key: 'Other', label: 'Other' },
];

export default function WhatIfSimulator({ income, expenses }) {
  const [selectedCategory, setSelectedCategory] = useState('Shopping');
  
  // Lookup original category spending amount safely
  const getOriginalSpend = (catName) => {
    return Number(expenses[catName.toLowerCase()] || expenses[catName]) || 0;
  };

  const initialCategorySpend = getOriginalSpend(selectedCategory);
  const [simulatedSpend, setSimulatedSpend] = useState(initialCategorySpend);

  const maxSliderValue = Math.max(15000, initialCategorySpend * 2);

  // Calculate current baseline metrics
  const currentSummary = calculateSummary(income, expenses);

  // Calculate simulated metrics
  const simulatedExpenses = {
    ...expenses,
    [selectedCategory.toLowerCase()]: Number(simulatedSpend) || 0,
    [selectedCategory]: Number(simulatedSpend) || 0,
  };

  const simulatedSummary = calculateSummary(income, simulatedExpenses);

  const monthlySavingsDelta = simulatedSummary.remainingSavings - currentSummary.remainingSavings;
  const potentialAnnualSavings = simulatedSummary.remainingSavings * 12;

  const handleCategorySelect = (catLabel) => {
    setSelectedCategory(catLabel);
    setSimulatedSpend(getOriginalSpend(catLabel));
  };

  const setPreset = (percentage) => {
    const original = getOriginalSpend(selectedCategory);
    setSimulatedSpend(Math.round(original * (1 - percentage)));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" /> What-If Savings Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust expenses dynamically to calculate potential monthly & annual savings
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
          Instant Calculation
        </span>
      </div>

      {/* Category selector chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.label;
          const amt = getOriginalSpend(cat.label);
          return (
            <button
              key={cat.key}
              onClick={() => handleCategorySelect(cat.label)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label} ({formatCurrency(amt)})
            </button>
          );
        })}
      </div>

      {/* Slider Controls */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">
            Simulated {selectedCategory} Expense
          </span>
          <span className="text-base font-extrabold text-indigo-600">
            {formatCurrency(simulatedSpend)}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={maxSliderValue}
          step="250"
          value={simulatedSpend}
          onChange={(e) => setSimulatedSpend(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />

        {/* Presets */}
        <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
          <span>₹0</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPreset(0.2)}
              className="px-2.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold"
            >
              -20%
            </button>
            <button
              onClick={() => setPreset(0.4)}
              className="px-2.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold"
            >
              -40%
            </button>
            <button
              onClick={() => setPreset(1.0)}
              className="px-2.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold"
            >
              Reset to 0
            </button>
          </div>
          <span>{formatCurrency(maxSliderValue)}</span>
        </div>
      </div>

      {/* Instant Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Monthly Savings
          </span>
          <span className="text-base font-bold text-slate-800">
            {formatCurrency(currentSummary.remainingSavings)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
            New Monthly Savings
          </span>
          <span className="text-base font-extrabold text-indigo-900">
            {formatCurrency(simulatedSummary.remainingSavings)}
          </span>
          {monthlySavingsDelta !== 0 && (
            <span
              className={`text-[10px] font-bold block mt-0.5 ${
                monthlySavingsDelta > 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {monthlySavingsDelta > 0 ? `+${formatCurrency(monthlySavingsDelta)}/mo` : `${formatCurrency(monthlySavingsDelta)}/mo`}
            </span>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Potential Annual Savings
          </span>
          <span className="text-base font-extrabold text-emerald-950">
            {formatCurrency(potentialAnnualSavings)}
          </span>
          <span className="text-[10px] font-medium text-emerald-700 block mt-0.5">
            Annual Projection
          </span>
        </div>

      </div>

    </div>
  );
}
