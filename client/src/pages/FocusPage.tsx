import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle2, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Task, ScheduleResponse } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface FocusPageProps {
  currentTask: Task | null;
  onEndFocus: (schedule: ScheduleResponse) => void;
  onOpenVoice: () => void;
}

export const FocusPage: React.FC<FocusPageProps> = ({ currentTask, onEndFocus, onOpenVoice }) => {
  const defaultTitle = currentTask ? currentTask.title : 'DBMS Assignment';
  const defaultDurationMins = currentTask ? currentTask.remaining_duration || 45 : 45;

  const [secondsLeft, setSecondsLeft] = useState(defaultDurationMins * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  // Reflection form inputs
  const [difficultyRating, setDifficultyRating] = useState<'Easy' | 'Moderate' | 'Difficult'>('Moderate');
  const [tookLonger, setTookLonger] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleStartSession = async () => {
    setIsActive(true);
    if (!sessionId && currentTask) {
      const res = await api.startFocus(currentTask.id);
      setSessionId(res.session.id);
    }
  };

  const handlePauseSession = () => {
    setIsActive(false);
  };

  const handleFinishSession = () => {
    setIsActive(false);
    setShowReflection(true);
  };

  const handleSaveReflection = async () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    const elapsedMins = Math.max(1, Math.round((defaultDurationMins * 60 - secondsLeft) / 60));
    const res = await api.endFocus({
      session_id: sessionId || undefined,
      actual_duration_mins: elapsedMins || 25,
      difficulty_rating: difficultyRating,
      took_longer_than_expected: tookLonger
    });
    setShowReflection(false);
    onEndFocus(res.schedule);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPercent = Math.min(100, Math.round(((defaultDurationMins * 60 - secondsLeft) / (defaultDurationMins * 60)) * 100));

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          DISTRACTION-FREE FOCUS MODE
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{defaultTitle}</h1>
        <p className="text-xs text-zinc-400">
          Stay focused. FocusFlow AI tracks your actual work velocity to refine future schedule estimates.
        </p>
      </div>

      {/* Main Timer Display */}
      <div className="glass-card max-w-lg mx-auto p-8 border-emerald-500/40 bg-gradient-to-b from-zinc-900 to-zinc-950 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Progress ring background highlight */}
        <div className="w-64 h-64 mx-auto rounded-full bg-zinc-950 border-4 border-zinc-800 flex flex-col items-center justify-center relative shadow-inner">
          <div
            className="absolute inset-0 rounded-full border-4 border-emerald-400 transition-all duration-1000"
            style={{
              clipPath: `inset(0 ${100 - progressPercent}% 0 0)`
            }}
          />

          <span className="font-mono text-5xl sm:text-6xl font-extrabold text-white tracking-tighter">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-emerald-400 font-semibold mt-2">{progressPercent}% Progress</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isActive ? (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:scale-105 transition"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={handlePauseSession}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-extrabold text-base hover:bg-amber-400 transition"
            >
              <Pause className="w-5 h-5 fill-zinc-950" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleFinishSession}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-bold text-xs border border-zinc-700 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Complete</span>
          </button>
        </div>
      </div>

      {/* Post Session Reflection Modal */}
      {showReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 border-emerald-500/40 space-y-4 text-xs">
            <h3 className="font-bold text-base text-white flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Focus Session Reflection</span>
            </h3>
            <p className="text-zinc-400">
              How was this focus block? This feedback refines your personal AI buffer estimates.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Perceived Task Difficulty:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Moderate', 'Difficult'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficultyRating(lvl)}
                      className={`py-2 rounded-xl border font-bold transition ${
                        difficultyRating === lvl
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tookLonger"
                  checked={tookLonger}
                  onChange={(e) => setTookLonger(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="tookLonger" className="text-zinc-300 font-semibold cursor-pointer">
                  Did this task take longer than originally expected?
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveReflection}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition mt-2"
            >
              Save Reflection & Update Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
