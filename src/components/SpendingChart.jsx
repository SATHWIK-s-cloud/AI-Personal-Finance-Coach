import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/financialCalculators';
import { PieChart as PieIcon } from 'lucide-react';

const CATEGORY_COLORS = {
  Rent: '#4f46e5', // Indigo-600
  Food: '#f59e0b', // Amber-500
  Transport: '#06b6d4', // Cyan-500
  Shopping: '#ec4899', // Pink-500
  Entertainment: '#8b5cf6', // Purple-500
  Bills: '#10b981', // Emerald-500
  Other: '#64748b', // Slate-500
};

export default function SpendingChart({ expenses }) {
  const data = [
    { name: 'Rent', value: Number(expenses.rent) || 0, color: CATEGORY_COLORS.Rent },
    { name: 'Food', value: Number(expenses.food) || 0, color: CATEGORY_COLORS.Food },
    { name: 'Transport', value: Number(expenses.transport) || 0, color: CATEGORY_COLORS.Transport },
    { name: 'Shopping', value: Number(expenses.shopping) || 0, color: CATEGORY_COLORS.Shopping },
    { name: 'Entertainment', value: Number(expenses.entertainment) || 0, color: CATEGORY_COLORS.Entertainment },
    { name: 'Bills', value: Number(expenses.bills) || 0, color: CATEGORY_COLORS.Bills },
    { name: 'Other', value: Number(expenses.other) || 0, color: CATEGORY_COLORS.Other },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }}></span>
            {item.name}
          </p>
          <p className="mt-1 text-slate-200">
            {formatCurrency(item.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" /> Spending Breakdown
          </h2>
          <p className="text-xs text-slate-500">Visual distribution of monthly expenses</p>
        </div>
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
          Total: {formatCurrency(total)}
        </span>
      </div>

      {total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
          <PieIcon className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
          <span>No expense data entered yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Recharts Donut Pie Chart */}
          <div className="md:col-span-6 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={600}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Label */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-medium">Expenses</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Breakdown Category List / Legend beside chart */}
          <div className="md:col-span-6 space-y-2">
            {data.map((item) => {
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-500">{percentage}%</span>
                    <span className="font-bold text-slate-900 min-w-[70px] text-right">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
