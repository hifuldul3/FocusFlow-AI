import React from 'react';
import { TrendingUp, LineChart, ShieldCheck, RefreshCw, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Insight, Task } from '../types';

interface InsightsPageProps {
  insights: Insight[];
  tasks: Task[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ insights, tasks }) => {
  const completed = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Productivity Insights</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Supportive, factual performance metrics & learning calibration
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-emerald-500/30">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Completion Velocity
          </span>
          <span className="text-2xl font-black text-white">{completed.length} / {tasks.length}</span>
          <span className="text-[11px] text-emerald-400 block mt-1">
            {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}% tasks completed this week
          </span>
        </div>

        <div className="glass-card p-5 border-emerald-500/30">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Total Focus Time
          </span>
          <span className="text-2xl font-black text-emerald-400">145 mins</span>
          <span className="text-[11px] text-zinc-400 block mt-1">2.4 hours focused work recorded</span>
        </div>

        <div className="glass-card p-5 border-emerald-500/30">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Estimation Calibration
          </span>
          <span className="text-2xl font-black text-amber-400">+20 mins</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Auto-applied planning safety buffer</span>
        </div>

        <div className="glass-card p-5 border-emerald-500/30">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Peak Performance
          </span>
          <span className="text-2xl font-black text-white">6 PM - 9 PM</span>
          <span className="text-[11px] text-emerald-400 block mt-1">Evening study window optimal</span>
        </div>
      </div>

      {/* AI Personalization Cards List */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Learned Productivity Signals</span>
        </h3>

        {insights.map((item) => (
          <div key={item.id} className="glass-card p-5 border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{item.category}</span>
              <span className="text-[10px] text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h4 className="font-bold text-white text-base">{item.title}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">{item.summary}</p>
            <p className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              {item.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
