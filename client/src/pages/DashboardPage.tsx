import React from 'react';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Zap,
  Mic,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { WhatShouldIDoNow } from '../components/WhatShouldIDoNow';
import { Task, ScheduleResponse, Insight, UserProfile } from '../types';

interface DashboardPageProps {
  profile: UserProfile;
  scheduleData: ScheduleResponse | null;
  tasks: Task[];
  insights: Insight[];
  onStartFocus: (task: Task) => void;
  onOpenVoice: () => void;
  onOpenRecovery: (task: Task) => void;
  onSelectPage: (page: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  scheduleData,
  tasks,
  insights,
  onStartFocus,
  onOpenVoice,
  onOpenRecovery,
  onSelectPage
}) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overload = scheduleData?.overload;
  const deadlineRisks = scheduleData?.deadlineRisks || [];
  const schedule = scheduleData?.schedule || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, <span className="text-emerald-400">{profile.name || 'Arun'}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {profile.department} • {profile.year_of_study}
          </p>
        </div>

        {/* AI Status Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="font-bold text-zinc-200 block">AI Adaptive Status: Optimal</span>
            <span className="text-[10px] text-zinc-400">Continuous Schedule Replanning Active</span>
          </div>
        </div>
      </div>

      {/* Hero Widget: WHAT SHOULD I DO NOW? */}
      <WhatShouldIDoNow
        recommendation={scheduleData?.whatShouldIDoNow}
        onStartFocus={onStartFocus}
        onOpenVoice={onOpenVoice}
      />

      {/* Alerts Grid: Workload Overload & Deadline Risks */}
      {(overload?.isOverloaded || deadlineRisks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overload?.isOverloaded && (
            <div className="glass-card p-5 border-amber-500/40 bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Workload Overload Detected</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{overload.message}</p>
              <div className="text-[11px] text-zinc-400 pt-1">
                <span className="font-semibold text-amber-300">Recommendation:</span>{' '}
                {overload.recommendations[0]}
              </div>
            </div>
          )}

          {deadlineRisks.length > 0 && (
            <div className="glass-card p-5 border-rose-500/40 bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>HIGH DEADLINE RISK</span>
              </div>
              {deadlineRisks.map((risk, idx) => (
                <div key={idx} className="text-xs text-zinc-300">
                  <span className="font-bold text-white">{risk.taskTitle}:</span> {risk.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Today's Schedule Timeline & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Today's Adaptive Schedule</h3>
            </div>
            <button
              onClick={() => onSelectPage('schedule')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {schedule.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No blocks scheduled for today.</p>
            ) : (
              schedule.slice(0, 6).map((block, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    block.block_type === 'event'
                      ? 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
                      : block.priority_level === 'CRITICAL'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 text-[11px] w-24">
                      {block.start_time} - {block.end_time}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">{block.title}</p>
                      <span className="text-[10px] text-zinc-400 uppercase">
                        {block.block_type === 'event' ? 'Fixed Event' : `${block.duration_mins} mins focus block`}
                      </span>
                    </div>
                  </div>

                  {block.block_type === 'task' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const taskObj = tasks.find((t) => t.id === block.task_id);
                          if (taskObj) onStartFocus(taskObj);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-[11px] hover:bg-emerald-400 transition"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => {
                          const taskObj = tasks.find((t) => t.id === block.task_id);
                          if (taskObj) onOpenRecovery(taskObj);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-[11px]"
                        title="Can't start? Trigger Recovery Mode"
                      >
                        Missed?
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Cards: Progress & Insights */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Current Workload</h3>
              <span className="text-xs font-mono text-emerald-400">
                {completedTasks.length}/{tasks.length} Done
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Weekly Task Completion Rate</span>
                  <span className="font-bold text-white">
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{
                      width: `${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block text-lg font-bold text-white">{activeTasks.length}</span>
                  <span className="text-[10px] text-zinc-400 uppercase">Pending Tasks</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block text-lg font-bold text-emerald-400">145 m</span>
                  <span className="text-[10px] text-zinc-400 uppercase">Focus Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Productivity Insight Card */}
          {insights.length > 0 && (
            <div className="glass-card p-5 border-emerald-500/30 bg-gradient-to-br from-zinc-900 to-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>AI Productivity Insight</span>
              </div>
              <h4 className="font-bold text-white text-sm">{insights[0].title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{insights[0].summary}</p>
              <p className="text-[11px] text-zinc-400 italic pt-1">{insights[0].details}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Microphone Action CTA Button */}
      <button
        onClick={onOpenVoice}
        className="fixed bottom-6 right-6 z-30 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all group flex items-center gap-2"
        title="Talk to FocusFlow AI"
      >
        <Mic className="w-6 h-6 fill-zinc-950 group-hover:animate-pulse" />
        <span className="hidden sm:inline font-extrabold text-sm pr-1">Talk to FocusFlow</span>
      </button>
    </div>
  );
};
