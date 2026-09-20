import React from 'react';
import { Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HealthScore({ score }) {
  // SVG Circular Gauge calculation
  const radius = 52;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#10b981'; // Emerald
  let badgeText = 'Good';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score >= 80) {
    scoreColor = '#059669'; // Emerald-600
    badgeText = 'Excellent';
    badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (score >= 65) {
    scoreColor = '#4f46e5'; // Indigo-600
    badgeText = 'Good';
    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (score >= 45) {
    scoreColor = '#f59e0b'; // Amber-500
    badgeText = 'Moderate';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    scoreColor = '#ef4444'; // Rose-500
    badgeText = 'Needs Attention';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🛡️</span> Financial Health Score
          </h2>
          <p className="text-xs text-slate-500">Holistic stability metric</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
          {badgeText}
        </span>
      </div>

      {/* Ring Gauge Visualization */}
      <div className="flex flex-col items-center justify-center py-3">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Dynamic Progress Stroke */}
            <circle
              stroke={scoreColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              out of 100
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Disclaimer */}
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
        <p className="flex items-start gap-1.5 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Your financial health score is calculated using your savings rate, spending behavior and financial habits.</span>
        </p>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> This is an application-defined score calculated for coaching insights, NOT an official credit or bank financial score.
          </span>
        </div>
      </div>

    </div>
  );
}
