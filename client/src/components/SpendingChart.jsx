import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { formatCurrency } from '../utils/financialCalculators';
import { PieChart as PieIcon, BarChart3, TrendingUp, GitCompare } from 'lucide-react';

const CATEGORY_COLORS = {
  Rent: '#4f46e5',
  Food: '#f59e0b',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Bills: '#10b981',
  Other: '#64748b',
};

const CATEGORIES = ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"];

export default function SpendingChart({ expenses, budgetLimits = {} }) {
  const [activeChartView, setActiveChartView] = useState('donut');

  // 1. Donut Pie Data
  const donutData = CATEGORIES.map((cat) => ({
    name: cat,
    value: Number(expenses[cat.toLowerCase()] || expenses[cat]) || 0,
    color: CATEGORY_COLORS[cat],
  })).filter((item) => item.value > 0);

  const totalSpent = donutData.reduce((sum, item) => sum + item.value, 0);

  // 2. Budget vs Actual Data
  const budgetVsActualData = CATEGORIES.map((cat) => {
    const limit = budgetLimits[cat] || (cat === 'Rent' ? 10000 : cat === 'Food' ? 6000 : 3500);
    const spent = Number(expenses[cat.toLowerCase()] || expenses[cat]) || 0;
    return {
      category: cat,
      Budget: limit,
      Actual: spent,
    };
  });

  // 3. Monthly Comparison Data (Current vs Previous Month)
  const previousMonthExpenses = {
    Rent: 10000,
    Food: 4500,
    Transport: 2800,
    Shopping: 3500,
    Entertainment: 1800,
    Bills: 2700,
    Other: 1000,
  };

  const comparisonData = CATEGORIES.map((cat) => ({
    category: cat,
    'Current Month': Number(expenses[cat.toLowerCase()] || expenses[cat]) || 0,
    'Previous Month': previousMonthExpenses[cat] || 0,
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          {label && <p className="font-bold text-slate-300 mb-1">{label}</p>}
          {payload.map((entry, idx) => (
            <p key={idx} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-bold text-white">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      
      {/* Header with Visualization Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" /> Interactive Financial Visualizations
          </h2>
          <p className="text-xs text-slate-500">Member 4 Module • Recharts visual analytics engine</p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveChartView('donut')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeChartView === 'donut' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" /> Category Donut
          </button>
          <button
            onClick={() => setActiveChartView('budget_vs_actual')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeChartView === 'budget_vs_actual' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Budget vs Actual
          </button>
          <button
            onClick={() => setActiveChartView('monthly_compare')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeChartView === 'monthly_compare' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" /> Monthly Compare
          </button>
        </div>
      </div>

      {/* CHART VIEW 1: DONUT PIE CHART */}
      {activeChartView === 'donut' && (
        <div>
          {totalSpent === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <PieIcon className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <span>No expense data recorded yet</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={500}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Spent</span>
                  <span className="text-sm font-extrabold text-slate-900">{formatCurrency(totalSpent)}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="md:col-span-6 space-y-2">
                {donutData.map((item) => {
                  const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">{pct}%</span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHART VIEW 2: BUDGET VS ACTUAL BAR CHART */}
      {activeChartView === 'budget_vs_actual' && (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CHART VIEW 3: MONTHLY COMPARISON */}
      {activeChartView === 'monthly_compare' && (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Previous Month" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current Month" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
