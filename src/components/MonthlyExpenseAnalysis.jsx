import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, BarChart2, Layers, AlertCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/financialCalculators';

// Helper to format YYYY-MM into Month Year string (e.g. "2026-09" -> "September 2026")
const formatMonthYearLabel = (yearMonthKey) => {
  if (!yearMonthKey) return '';
  const [year, month] = yearMonthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Format YYYY-MM into Short Month (e.g. "2026-09" -> "Sep 26")
const formatShortMonthLabel = (yearMonthKey) => {
  if (!yearMonthKey) return '';
  const [year, month] = yearMonthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export default function MonthlyExpenseAnalysis({ expensesList = [] }) {
  // 1. Group expenses by YYYY-MM
  const { monthlyDataMap, allMonthsList } = useMemo(() => {
    const map = {};
    
    // Sort expenses by date ascending
    const sorted = [...expensesList].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach((exp) => {
      if (!exp.date) return;
      const ym = exp.date.substring(0, 7); // "YYYY-MM"
      if (!map[ym]) {
        map[ym] = {
          yearMonth: ym,
          total: 0,
          transactions: [],
          categoryTotals: {},
        };
      }
      const amount = Number(exp.amount) || 0;
      map[ym].total += amount;
      map[ym].transactions.push(exp);
      const cat = exp.category || 'Other';
      map[ym].categoryTotals[cat] = (map[ym].categoryTotals[cat] || 0) + amount;
    });

    // Ensure we have standard months if dataset is sparse
    const defaultMonths = ['2026-07', '2026-08', '2026-09', '2026-10'];
    defaultMonths.forEach(ym => {
      if (!map[ym]) {
        map[ym] = { yearMonth: ym, total: 0, transactions: [], categoryTotals: {} };
      }
    });

    const months = Object.keys(map).sort();
    return { monthlyDataMap: map, allMonthsList: months };
  }, [expensesList]);

  // Selected month state (defaults to latest available month or current month "2026-09")
  const defaultSelected = allMonthsList.includes('2026-09')
    ? '2026-09'
    : allMonthsList[allMonthsList.length - 1] || '2026-09';
    
  const [selectedMonth, setSelectedMonth] = useState(defaultSelected);

  // If selectedMonth is not in list (e.g. after deletion), fallback safely
  const activeMonthKey = allMonthsList.includes(selectedMonth)
    ? selectedMonth
    : allMonthsList[allMonthsList.length - 1] || '2026-09';

  // Navigate to Previous/Next month
  const currentIdx = allMonthsList.indexOf(activeMonthKey);
  
  const handlePrevMonth = () => {
    if (currentIdx > 0) {
      setSelectedMonth(allMonthsList[currentIdx - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentIdx < allMonthsList.length - 1) {
      setSelectedMonth(allMonthsList[currentIdx + 1]);
    }
  };

  // Metrics for active selected month
  const activeMonthData = monthlyDataMap[activeMonthKey] || { total: 0, transactions: [], categoryTotals: {} };
  const monthTransactionsCount = activeMonthData.transactions.length;
  const monthTotalExpense = activeMonthData.total;

  // Highest spending category in selected month
  const highestCategoryEntry = useMemo(() => {
    const cats = Object.entries(activeMonthData.categoryTotals);
    if (cats.length === 0) return { category: 'N/A', amount: 0 };
    cats.sort((a, b) => b[1] - a[1]);
    return { category: cats[0][0], amount: cats[0][1] };
  }, [activeMonthData]);

  // Average daily spending in selected month (using total days in month)
  const averageDailySpending = useMemo(() => {
    if (!activeMonthKey || monthTotalExpense === 0) return 0;
    const [year, month] = activeMonthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Math.round(monthTotalExpense / daysInMonth);
  }, [activeMonthKey, monthTotalExpense]);

  // Previous Month metrics
  const prevMonthKey = currentIdx > 0 ? allMonthsList[currentIdx - 1] : null;
  const prevMonthData = prevMonthKey ? monthlyDataMap[prevMonthKey] : null;
  const prevMonthTotal = prevMonthData ? prevMonthData.total : 0;

  // MoM Percentage Increase / Decrease
  const momComparison = useMemo(() => {
    if (!prevMonthKey || prevMonthTotal === 0) {
      return { diff: 0, percentage: 0, isIncrease: false, hasPrev: false };
    }
    const diff = monthTotalExpense - prevMonthTotal;
    const pct = Math.round((diff / prevMonthTotal) * 100);
    return {
      diff,
      percentage: Math.abs(pct),
      isIncrease: diff >= 0,
      hasPrev: true,
    };
  }, [monthTotalExpense, prevMonthTotal, prevMonthKey]);

  // Highest-expense month across all available transaction history
  const peakExpenseMonth = useMemo(() => {
    let peakYM = '';
    let maxTotal = -1;
    allMonthsList.forEach(ym => {
      const tot = monthlyDataMap[ym]?.total || 0;
      if (tot > maxTotal) {
        maxTotal = tot;
        peakYM = ym;
      }
    });
    return {
      monthLabel: formatMonthYearLabel(peakYM),
      amount: maxTotal > 0 ? maxTotal : 0,
    };
  }, [allMonthsList, monthlyDataMap]);

  // Recharts Chart Data (Monthly Spending History)
  const monthlyChartData = useMemo(() => {
    return allMonthsList.map((ym) => ({
      ymKey: ym,
      month: formatShortMonthLabel(ym),
      fullLabel: formatMonthYearLabel(ym),
      Expenses: monthlyDataMap[ym]?.total || 0,
      isSelected: ym === activeMonthKey,
    }));
  }, [allMonthsList, monthlyDataMap, activeMonthKey]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-slate-300 mb-1">{data.fullLabel}</p>
          <p className="text-emerald-400 font-extrabold text-sm">
            Total Spent: {formatCurrency(data.Expenses)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      
      {/* Dynamic Month Header & Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Dynamic Monthly Expense Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any month to dynamically analyze total expenses, daily averages & historical trends
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto justify-between">
          <button
            onClick={handlePrevMonth}
            disabled={currentIdx <= 0}
            className="p-1.5 rounded-xl hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <select
              value={activeMonthKey}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer py-1"
            >
              {allMonthsList.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthYearLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={currentIdx >= allMonthsList.length - 1}
            className="p-1.5 rounded-xl hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State Banner if selected month has 0 transactions */}
      {monthTransactionsCount === 0 ? (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            No expenses recorded for this month.
          </h3>
          <p className="text-xs text-slate-500">
            Add new transactions dated in {formatMonthYearLabel(activeMonthKey)} to automatically populate this month's analysis.
          </p>
        </div>
      ) : (
        /* Selected Month Metrics Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Expenses */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-4 rounded-2xl border border-indigo-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Expenses
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrency(monthTotalExpense)}
            </div>
            <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{monthTransactionsCount} transactions in {formatShortMonthLabel(activeMonthKey)}</span>
            </div>
          </div>

          {/* Card 2: Highest Spending Category */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Highest Category
            </span>
            <div className="text-lg font-bold text-slate-900 truncate">
              {highestCategoryEntry.category}
            </div>
            <div className="mt-2 text-[11px] text-indigo-600 font-bold">
              {formatCurrency(highestCategoryEntry.amount)} spent
            </div>
          </div>

          {/* Card 3: Average Daily Spending */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Avg Daily Spending
            </span>
            <div className="text-lg font-bold text-slate-900">
              {formatCurrency(averageDailySpending)} / day
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Calculated across month days
            </div>
          </div>

          {/* Card 4: Month-over-Month Comparison */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Vs. Previous Month
            </span>
            {momComparison.hasPrev ? (
              <div>
                <div className="flex items-center gap-1.5 text-base font-bold">
                  {momComparison.isIncrease ? (
                    <span className="text-red-600 flex items-center gap-0.5">
                      <TrendingUp className="w-4 h-4" /> +{momComparison.percentage}%
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown className="w-4 h-4" /> -{momComparison.percentage}%
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Prev Month: <span className="font-semibold text-slate-700">{formatCurrency(prevMonthTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1 font-medium">
                No previous month data
              </div>
            )}
          </div>

        </div>
      )}

      {/* Historical Summary Banner: Highest-Expense Month */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              All-Time Spending Peak
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100">
              Highest-Expense Month: <span className="text-white font-extrabold">{peakExpenseMonth.monthLabel}</span>
            </h4>
          </div>
        </div>
        <div className="text-right sm:text-right w-full sm:w-auto">
          <span className="text-xs sm:text-base font-extrabold text-amber-300">
            {formatCurrency(peakExpenseMonth.amount)}
          </span>
        </div>
      </div>

      {/* MONTHLY SPENDING HISTORY CHART */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600" /> Monthly Spending History
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Dynamic timeline across transaction records
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Expenses" radius={[6, 6, 0, 0]}>
                {monthlyChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isSelected ? '#4f46e5' : '#94a3b8'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMonth(entry.ymKey)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
