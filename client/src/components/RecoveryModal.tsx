import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, X, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Task, ScheduleResponse } from '../types';

interface RecoveryModalProps {
  task: Task | null;
  onClose: () => void;
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  task,
  onClose,
  onScheduleUpdated
}) => {
  if (!task) return null;

  const [selectedReason, setSelectedReason] = useState('Too difficult');
  const [customNotes, setCustomNotes] = useState('');
  const [isReplanning, setIsReplanning] = useState(false);

  const reasons = [
    { id: 'Too difficult', title: 'Too difficult / unexpected complexity', desc: 'FocusFlow will add safety buffers and suggest splitting into subtask sessions.' },
    { id: 'Not enough time', title: 'Not enough time', desc: 'FocusFlow will shift lower-priority items and find the next feasible slot.' },
    { id: 'Something came up', title: 'Something came up (Interruption)', desc: 'FocusFlow will update today\'s availability override for unplanned busy periods.' },
    { id: 'Couldn\'t focus', title: 'Couldn\'t focus / needed rest', desc: 'FocusFlow will shorten upcoming session blocks to 25-minute Pomodoros.' }
  ];

  const handleReplan = async () => {
    setIsReplanning(true);
    try {
      const res = await api.triggerRecoveryMode(task.id, selectedReason, customNotes);
      setIsReplanning(false);
      onScheduleUpdated(res);
      onClose();
    } catch (e) {
      setIsReplanning(false);
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg p-6 border-amber-500/50 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-lg text-white">FocusFlow Recovery Mode</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h4 className="text-base font-bold text-amber-300">
            Plans change! What's getting in the way of "{task.title}"?
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            FocusFlow AI doesn't penalize missed tasks. Select a reason below so the AI engine can automatically recalculate a feasible schedule for you:
          </p>
        </div>

        <div className="space-y-2.5">
          {reasons.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedReason(r.id)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                selectedReason === r.id
                  ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-medium'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <p className="font-bold text-zinc-200 text-sm">{r.title}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Optional Context Notes</label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Need to re-read DBMS Chapter 4 before continuing..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleReplan}
            disabled={isReplanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold text-xs hover:scale-[1.02] transition"
          >
            <RefreshCw className={`w-4 h-4 ${isReplanning ? 'animate-spin' : ''}`} />
            <span>Adapt & Rebuild Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
