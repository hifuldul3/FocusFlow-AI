import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, RefreshCw, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScheduleResponse, UserProfile } from '../types';
import { api } from '../services/api';

interface SchedulePageProps {
  scheduleData: ScheduleResponse | null;
  profile: UserProfile;
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
  onOpenVoice: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  scheduleData,
  profile,
  onScheduleUpdated,
  onOpenVoice
}) => {
  const [overrideStart, setOverrideStart] = useState('19:00');
  const [overrideEnd, setOverrideEnd] = useState('22:00');
  const [isApplyingOverride, setIsApplyingOverride] = useState(false);

  const handleApplyOverride = async () => {
    setIsApplyingOverride(true);
    try {
      const res = await api.addAvailabilityException({
        date: new Date().toISOString().split('T')[0],
        start_time: overrideStart,
        end_time: overrideEnd,
        is_available: true,
        reason: 'Tonight availability override'
      });
      setIsApplyingOverride(false);
      onScheduleUpdated(res.schedule);
    } catch (e) {
      setIsApplyingOverride(false);
    }
  };

  const scheduleBlocks = scheduleData?.schedule || [];
  const overload = scheduleData?.overload;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dynamic Schedule</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Adapts automatically to your real availability & routine changes
          </p>
        </div>

        <button
          onClick={onOpenVoice}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Change Today's Availability via Voice</span>
        </button>
      </div>

      {/* Dynamic Availability Quick Override Box */}
      <div className="glass-card p-5 border-emerald-500/30 bg-gradient-to-r from-zinc-900 to-zinc-950 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Override Today's Free Availability Window</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
            Today's override takes precedence over Usual Routine
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-zinc-300 font-semibold">"I am free today only from:"</span>
          <input
            type="time"
            value={overrideStart}
            onChange={(e) => setOverrideStart(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-white"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="time"
            value={overrideEnd}
            onChange={(e) => setOverrideEnd(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-white"
          />
          <button
            onClick={handleApplyOverride}
            disabled={isApplyingOverride}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            {isApplyingOverride ? 'Updating...' : 'Update & Replan Schedule'}
          </button>
        </div>
      </div>

      {/* Overload Alert */}
      {overload?.isOverloaded && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Schedule Overload Warning</span>
          </div>
          <p>{overload.message}</p>
        </div>
      )}

      {/* Timeline View */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-3">
          Today's Hourly Timeline ({new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })})
        </h3>

        <div className="relative border-l-2 border-zinc-800 ml-4 pl-6 space-y-6">
          {scheduleBlocks.map((block, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Marker node */}
              <div
                className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                  block.block_type === 'event'
                    ? 'bg-zinc-800 border-zinc-600'
                    : block.priority_level === 'CRITICAL'
                    ? 'bg-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/50'
                    : 'bg-teal-400 border-teal-500'
                }`}
              />

              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-emerald-400 font-bold">
                      {block.start_time} - {block.end_time}
                    </span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full uppercase font-medium">
                      {block.block_type === 'event' ? 'Fixed Event' : `${block.duration_mins}m Focus Session`}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{block.title}</h4>
                </div>

                {block.priority_level && (
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      block.priority_level === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {block.priority_level}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
