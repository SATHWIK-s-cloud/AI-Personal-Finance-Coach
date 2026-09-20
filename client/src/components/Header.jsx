import React from 'react';
import { Wallet, Sparkles, LayoutDashboard, CreditCard, Target, Lightbulb, MessageSquare, RotateCcw, LogOut, User as UserIcon } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onResetDemo, isResetting, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'budget', label: 'Budget & Savings', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                  AI Personal Finance Coach
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Hackathon MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Full-Stack Personal Financial Intelligence Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile, Reset Demo & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>{user.name || user.email}</span>
              </div>
            )}

            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset state to initial sample demo data"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out of your account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-lg transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-100 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
