import React from 'react';
import { Sparkles, ArrowRight, Zap, ShieldCheck, AlertCircle, Lightbulb } from 'lucide-react';

export default function AIInsights({ insights }) {
  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'action':
        return <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
      case 'positive':
        return <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Lightbulb className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              AI Financial Insights
            </h2>
            <p className="text-xs text-slate-400">Personalized recommendations for your budget</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
          Engine v1.0
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights && insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 backdrop-blur border border-slate-700/60 p-3.5 rounded-xl flex items-start gap-3 hover:bg-slate-800/90 transition-all"
            >
              {getIcon(insight.type)}
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {insight.text}
              </p>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400 p-4 text-center">
            Enter your monthly finances above to generate intelligent AI recommendations.
          </div>
        )}
      </div>

      {/* Footer / Backend Notice */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          Ready for REST endpoint integration (<code className="text-indigo-300 font-mono">POST /api/insights</code>)
        </span>
        <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer">
          Refresh <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
