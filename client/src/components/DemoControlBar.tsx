import React from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, Zap, Sparkles, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { ScheduleResponse } from '../types';

interface DemoControlBarProps {
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
  onShowMessage: (msg: string) => void;
  onOpenAuthModal?: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  onScheduleUpdated,
  onShowMessage,
  onOpenAuthModal
}) => {
  const handleReset = async () => {
    const res = await api.resetDemo();
    onScheduleUpdated(res.schedule);
    onShowMessage('Demo Data Reset! Student profile Arun & 3 baseline tasks loaded.');
  };

  const handleSimulateMissedTask = async () => {
    const res = await api.simulateMissedTask();
    onScheduleUpdated(res);
    onShowMessage('Recovery Mode Activated! DBMS Assignment was missed -> replanned with safety buffer.');
  };

  const handleSimulateEarlyCompletion = async () => {
    const res = await api.simulateEarlyCompletion();
    onScheduleUpdated(res.schedule);
    onShowMessage('Early Completion Triggered! DBMS finished 25m early. Freed time detected.');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/90 via-zinc-900 to-indigo-950/90 border-b border-emerald-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-300">
      <div className="flex items-center gap-2 font-semibold">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="uppercase tracking-wider text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
          Hackathon Demo Control
        </span>
        <span className="hidden sm:inline text-zinc-400">Quickly test golden workflow steps:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition"
            title="Open Instant Guest Access / Switch Account"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Demo Access</span>
          </button>
        )}

        <button
          onClick={handleSimulateMissedTask}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition"
          title="Simulate student missing a task to demonstrate Recovery Mode and adaptive replanning"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Simulate Missed Task</span>
        </button>

        <button
          onClick={handleSimulateEarlyCompletion}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-medium transition"
          title="Simulate task finished early to demonstrate freed time identification"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Complete Task Early</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition"
          title="Reset back to initial student Arun demo state"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
