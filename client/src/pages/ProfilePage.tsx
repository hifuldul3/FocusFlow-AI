import React, { useState } from 'react';
import { User, Clock, Calendar, Save, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { UserProfile, ScheduleResponse } from '../types';
import { api } from '../services/api';

interface ProfilePageProps {
  profile: UserProfile;
  onProfileUpdated: (updatedProfile: UserProfile, schedule: ScheduleResponse) => void;
  onResetDemo: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onProfileUpdated, onResetDemo }) => {
  const [name, setName] = useState(profile.name || 'Arun');
  const [college, setCollege] = useState(profile.college || 'National Institute of Technology');
  const [department, setDepartment] = useState(profile.department || 'Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(profile.year_of_study || '3rd Year');
  const [wakeTime, setWakeTime] = useState(profile.wake_time || '07:00');
  const [sleepTime, setSleepTime] = useState(profile.sleep_time || '23:00');
  const [preferredWorkPeriod, setPreferredWorkPeriod] = useState(profile.preferred_work_period || 'evening');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        college,
        department,
        year_of_study: yearOfStudy,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        preferred_work_period: preferredWorkPeriod as any
      });
      setIsSaving(false);
      onProfileUpdated(res.profile, res.schedule);
    } catch (e) {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Profile & Student Routine</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Configure your baseline usual routine, college hours, and AI study preferences
        </p>
      </div>

      {/* Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>These are your usual patterns. You can change them or override today's free window anytime.</span>
      </div>

      <div className="glass-card p-6 space-y-6 border-zinc-800">
        <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Basic Student Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Year of Study</label>
            <input
              type="text"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">College / University</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-3 pt-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Daily Baseline Routine</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Usual Wake Time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Usual Sleep Time</label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Preferred Hard Work Period</label>
            <select
              value={preferredWorkPeriod}
              onChange={(e: any) => setPreferredWorkPeriod(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="morning">Morning (8 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
              <option value="evening">Evening (6 PM - 9 PM)</option>
              <option value="night">Night (9 PM - 12 AM)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <button
            onClick={onResetDemo}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data & Personalization</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Routine & Replan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
