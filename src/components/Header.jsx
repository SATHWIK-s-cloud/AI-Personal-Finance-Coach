import React from 'react';
import { Wallet, Sparkles, TrendingUp, ShieldCheck, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  AI Personal Finance Coach
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3" /> MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Understand your money. Improve your financial health.
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#overview" className="text-indigo-600 font-semibold flex items-center gap-1.5 transition-colors">
              <TrendingUp className="w-4 h-4" /> Dashboard
            </a>
            <a href="#breakdown" className="hover:text-indigo-600 transition-colors">
              Breakdown
            </a>
            <a href="#insights" className="hover:text-indigo-600 transition-colors">
              AI Insights
            </a>
            <a href="#simulator" className="hover:text-indigo-600 transition-colors">
              What-If Simulator
            </a>
            <a href="#chat" className="hover:text-indigo-600 transition-colors">
              AI Coach
            </a>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-800">Demo User</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Health Score Active
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer">
              <User className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
