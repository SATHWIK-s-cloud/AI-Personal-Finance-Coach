import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AIInsights({ insights }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              AI Insights & Analysis
            </h2>
            <p className="text-xs text-slate-400">Calculated financial facts & AI recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Facts vs Recommendations
        </div>
      </div>

      {/* Insights Cards */}
      <div className="space-y-3">
        {insights && insights.length > 0 ? (
          insights.map((insight, idx) => {
            const isFact = insight.type === 'fact' || insight.type === 'info' || insight.type === 'warning';
            const isRecommendation = insight.type === 'recommendation' || insight.type === 'action' || insight.type === 'tip';

            return (
              <div
                key={insight.id || idx}
                className="bg-slate-800/70 backdrop-blur border border-slate-700/60 p-4 rounded-xl space-y-2 hover:bg-slate-800/90 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                    {isFact ? (
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {insight.title || (isFact ? 'Calculated Fact' : 'AI Recommendation')}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                      isFact
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    }`}
                  >
                    {isFact ? 'Calculated Fact' : 'AI Recommendation'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {insight.text}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-slate-400 p-6 text-center border border-dashed border-slate-700 rounded-xl">
            No insights generated yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-slate-400">
          Powered by FastAPI REST API (<code className="text-indigo-300">GET /api/analysis</code>)
        </span>
        <span className="text-indigo-400 font-semibold flex items-center gap-1">
          Auto-updated <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
