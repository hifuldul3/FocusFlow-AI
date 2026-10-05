import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTree,
  Filter,
  Play,
  RefreshCw,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Task, ScheduleResponse } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface TasksPageProps {
  tasks: Task[];
  onStartFocus: (task: Task) => void;
  onOpenRecovery: (task: Task) => void;
  onOpenVoice: () => void;
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  onStartFocus,
  onOpenRecovery,
  onOpenVoice,
  onScheduleUpdated
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null);

  const handleCompleteTask = async (task: Task) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    const res = await api.completeTask(task.id);
    onScheduleUpdated(res.schedule);
  };

  const handleDecompose = async (task: Task) => {
    setDecomposingTaskId(task.id);
    try {
      const res = await api.decomposeTask(task.title);
      const updatedTask = await api.updateTask(task.id, {
        subtasks: res.subtasks as any
      });
      setDecomposingTaskId(null);
      onScheduleUpdated(updatedTask.schedule);
    } catch (e) {
      setDecomposingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return t.status === 'completed';
    if (activeFilter === 'Overdue') return t.status === 'overdue' || new Date(t.deadline).getTime() < Date.now();
    if (activeFilter === 'High Priority') return t.priority_level === 'CRITICAL' || t.priority_level === 'HIGH';
    if (activeFilter === 'Postponed') return t.status === 'postponed';
    return true;
  });

  const filterTabs = ['All', 'High Priority', 'Postponed', 'Overdue', 'Completed'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Tasks</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Dynamic effort tracking & AI subtask decomposition
          </p>
        </div>

        <button
          onClick={onOpenVoice}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task via Voice/Text</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === tab
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-8 text-center text-zinc-400 text-xs">
            No tasks found in filter "{activeFilter}".
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`glass-card p-5 space-y-4 border transition ${
                task.status === 'completed'
                  ? 'opacity-60 border-zinc-800/80 bg-zinc-950/40'
                  : task.priority_level === 'CRITICAL'
                  ? 'border-emerald-500/40'
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        task.status === 'completed'
                          ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          : task.priority_level === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {task.status === 'completed' ? 'COMPLETED' : `${task.priority_level} PRIORITY (${task.priority_score})`}
                    </span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      Difficulty: {task.difficulty}
                    </span>
                  </div>

                  <h3 className={`font-extrabold text-base sm:text-lg text-white ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && <p className="text-xs text-zinc-400">{task.description}</p>}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  {task.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => onStartFocus(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-zinc-950" />
                        <span>Focus</span>
                      </button>

                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Done</span>
                      </button>

                      <button
                        onClick={() => onOpenRecovery(task)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs transition"
                        title="Trigger Recovery Mode if delayed"
                      >
                        Replan
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress & Subtasks */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span>
                    Est: <strong className="text-white">{task.estimated_duration}m</strong>
                  </span>
                  <span>
                    Rem: <strong className="text-emerald-400">{task.remaining_duration}m</strong>
                  </span>
                  <span>
                    Deadline: <strong className="text-zinc-200">{new Date(task.deadline).toLocaleDateString()}</strong>
                  </span>
                </div>

                {task.status !== 'completed' && (
                  <button
                    onClick={() => handleDecompose(task)}
                    disabled={decomposingTaskId === task.id}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <ListTree className="w-3.5 h-3.5" />
                    <span>{decomposingTaskId === task.id ? 'Decomposing...' : 'AI Subtasks Breakdown'}</span>
                  </button>
                )}
              </div>

              {/* Subtasks rendering */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                  <p className="font-semibold text-zinc-300">Subtask Breakdown:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{st.title} ({st.estimated_duration_mins}m)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
