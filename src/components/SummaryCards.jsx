import React from 'react';
import { Wallet, CreditCard, PiggyBank, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculators';

export default function SummaryCards({ income, totalExpenses, remainingSavings, savingsRate }) {
  const isDeficit = remainingSavings < 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Monthly Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(income)}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              Total monthly inflow
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-b-2xl"></div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalExpenses)}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              Sum of 7 expense categories
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-2xl"></div>
        </div>

        {/* Card 3: Remaining Savings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining Savings
            </span>
            <div className={`w-9 h-9 rounded-xl ${isDeficit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {isDeficit ? <AlertTriangle className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold ${isDeficit ? 'text-rose-600' : 'text-emerald-600'} tracking-tight`}>
              {formatCurrency(remainingSavings)}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">
                Income minus expenses
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                savingsRate >= 20
                  ? 'bg-emerald-100 text-emerald-800'
                  : savingsRate >= 10
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                <TrendingUp className="w-3 h-3" /> Savings Rate: {savingsRate}%
              </span>
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${isDeficit ? 'bg-rose-500' : 'bg-emerald-500'} rounded-b-2xl`}></div>
        </div>

      </div>
    </div>
  );
}
