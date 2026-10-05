import React from 'react';
import { Play, Sparkles, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Task, ScheduleBlock } from '../types';

interface WhatShouldIDoNowProps {
  recommendation?: {
    task: Task;
    recommendedDurationMins: number;
    reason: string;
    block?: ScheduleBlock;
  };
  onStartFocus: (task: Task) => void;
  onOpenVoice: () => void;
}

export const WhatShouldIDoNow: React.FC<WhatShouldIDoNowProps> = ({
  recommendation,
  onStartFocus,
  onOpenVoice
}) => {
  if (!recommendation) {
    return (
      <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 text-center">
        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-pulse" />
        <h3 className="font-bold text-lg text-white">All caught up!</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
          No pending tasks left for today. Tell FocusFlow AI about your next assignment or enjoy your free time!
        </p>
        <button
          onClick={onOpenVoice}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-sm hover:bg-emerald-400 transition"
        >
          <span>Add New Task</span>
        </button>
      </div>
    );
  }

  const { task, recommendedDurationMins, reason } = recommendation;

  return (
    <div className="relative overflow-hidden glass-card p-6 border-emerald-500/40 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/30 shadow-2xl">
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              WHAT SHOULD I DO NOW?
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              task.priority_level === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {task.priority_level} Priority ({task.priority_score}/100)
            </span>
          </div>

          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {task.title}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
              {task.description || 'Focus session recommended for optimal progress.'}
            </p>
          </div>

          {/* Reasoning pill */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Why FocusFlow recommended this:</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">{reason}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center justify-center gap-3 shrink-0">
          <div className="text-center px-4 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
            <span className="block text-lg font-bold text-white">{recommendedDurationMins} mins</span>
            <span>Recommended Session</span>
          </div>

          <button
            onClick={() => onStartFocus(task)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <Play className="w-5 h-5 fill-zinc-950" />
            <span>START FOCUS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
