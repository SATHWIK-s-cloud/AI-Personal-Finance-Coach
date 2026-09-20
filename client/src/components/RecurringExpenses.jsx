import React, { useMemo } from 'react';
import { Repeat, Calendar, ArrowRight, ShieldAlert, CheckCircle2, Sparkles, Tag, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculators';

// Category Badge Color Mapping
const CATEGORY_STYLES = {
  Rent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Food: 'bg-amber-50 text-amber-700 border-amber-200',
  Transport: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  Bills: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

// Calculate next expected date (+1 month)
const calculateNextOccurrence = (lastDateStr) => {
  if (!lastDateStr) return 'N/A';
  const d = new Date(lastDateStr);
  if (isNaN(d.getTime())) return 'N/A';
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

export default function RecurringExpenses({ expensesList = [] }) {
  
  // Dynamic Recurring Expense Detection Algorithm
  const recurringItems = useMemo(() => {
    // Map to group expenses by normalized title / description
    const titleMap = {};

    expensesList.forEach((exp) => {
      const normKey = exp.description.trim().toLowerCase();
      if (!titleMap[normKey]) {
        titleMap[normKey] = {
          name: exp.description,
          category: exp.category || 'Bills',
          amount: Number(exp.amount) || 0,
          occurrences: [],
          isExplicitlyRecurring: !!exp.is_recurring,
        };
      }
      titleMap[normKey].occurrences.push(exp);
      if (exp.is_recurring) {
        titleMap[normKey].isExplicitlyRecurring = true;
      }
    });

    const detected = [];

    Object.values(titleMap).forEach((group) => {
      // Sort occurrences by date descending to find latest occurrence
      group.occurrences.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestExp = group.occurrences[0];

      // Criteria for recurring expense:
      // 1. Explicitly marked as recurring (is_recurring === true) OR
      // 2. Multiple transaction occurrences with same name OR
      // 3. Known subscription / utility keywords (Rent, Netflix, Spotify, Electricity, Bill, Recharge, Pass)
      const titleLower = group.name.toLowerCase();
      const isKnownSubscription = 
        titleLower.includes('rent') ||
        titleLower.includes('netflix') ||
        titleLower.includes('spotify') ||
        titleLower.includes('bill') ||
        titleLower.includes('electricity') ||
        titleLower.includes('recharge') ||
        titleLower.includes('pass') ||
        titleLower.includes('subscription') ||
        titleLower.includes('wifi') ||
        titleLower.includes('broadband') ||
        titleLower.includes('insurance');

      const isRecurring = group.isExplicitlyRecurring || group.occurrences.length > 1 || isKnownSubscription;

      if (isRecurring) {
        const lastDate = latestExp ? latestExp.date : new Date().toISOString().split('T')[0];
        const nextDate = calculateNextOccurrence(lastDate);
        
        detected.push({
          id: latestExp ? latestExp.id : `rec-${Date.now()}`,
          name: latestExp ? latestExp.description : group.name,
          amount: latestExp ? Number(latestExp.amount) : group.amount,
          category: latestExp ? latestExp.category : group.category,
          frequency: 'Monthly',
          lastOccurrence: lastDate,
          nextOccurrence: nextDate,
          monthlyEstimate: latestExp ? Number(latestExp.amount) : group.amount,
        });
      }
    });

    return detected;
  }, [expensesList]);

  // Total Recurring Monthly Amount
  const totalRecurringMonthly = useMemo(() => {
    return recurringItems.reduce((sum, item) => sum + item.monthlyEstimate, 0);
  }, [recurringItems]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      
      {/* Header & Total Recurring Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-600" /> Recurring & Repetitive Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated detection of regular commitments, subscriptions & fixed monthly bills
          </p>
        </div>

        {/* Total Banner */}
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Total Recurring Monthly
            </span>
            <span className="text-base font-extrabold text-indigo-950">
              Total recurring monthly expenses: {formatCurrency(totalRecurringMonthly)}
            </span>
          </div>
        </div>
      </div>

      {/* List of Recurring Expenses */}
      {recurringItems.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
          No recurring expenses detected yet. Check "Mark as Recurring" when adding expenses.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringItems.map((item) => {
            const catBadgeStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Other;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 group"
              >
                {/* Title & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadgeStyle}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                      {item.frequency}
                    </span>
                  </div>
                </div>

                {/* Dates & Billing Info */}
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Last Paid</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.lastOccurrence}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Next Expected</span>
                    <span className="font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      {item.nextOccurrence}
                    </span>
                  </div>
                </div>

                {/* Monthly Estimate Summary */}
                <div className="bg-indigo-50/50 p-2 rounded-xl flex items-center justify-between text-[11px] text-indigo-900">
                  <span className="font-medium text-slate-600">Estimated Monthly Impact</span>
                  <span className="font-bold text-indigo-700">{formatCurrency(item.monthlyEstimate)}/mo</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
