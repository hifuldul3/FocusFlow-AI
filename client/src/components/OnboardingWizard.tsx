import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, User, Clock, Calendar, HeartHandshake } from 'lucide-react';
import { UserProfile, ScheduleResponse } from '../types';
import { api } from '../services/api';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, schedule: ScheduleResponse) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Arun');
  const [college, setCollege] = useState('National Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [naturalRoutine, setNaturalRoutine] = useState(
    "I usually have college from 8:30 AM to 4:30 PM and I'm normally free from 6 PM to 9 PM."
  );

  const [holidayCategory, setHolidayCategory] = useState('Mixed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.updateProfile({
        name,
        college,
        department,
        year_of_study: yearOfStudy,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        holiday_category: holidayCategory,
        preferred_work_period: 'evening'
      });
      setIsSubmitting(false);
      onComplete(res.profile, res.schedule);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="glass-card w-full max-w-xl p-8 border-emerald-500/40 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-black flex items-center justify-center">
              <Sparkles className="w-6 h-6 fill-zinc-950" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white">Welcome to FocusFlow AI</h2>
              <p className="text-xs text-zinc-400">Step {step} of 4 — Conversational Onboarding</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {step === 1 ? 'Basic Info' : step === 2 ? 'Daily Routine' : step === 3 ? 'Weekly Pattern' : 'Holidays'}
          </span>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-zinc-300 font-medium">Let's get to know you first:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Year of Study</label>
                <input
                  type="text"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Department / Branch</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: Daily Routine */}
        {step === 2 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-emerald-300 font-semibold italic">
              "What time do you usually wake up, sleep, and do your hard work?"
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Sleep Time</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Describe your usual routine in natural language:</label>
              <textarea
                value={naturalRoutine}
                onChange={(e) => setNaturalRoutine(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Weekly Pattern */}
        {step === 3 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-zinc-300">Here are your extracted baseline weekly rules:</p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-white">Monday - Friday:</span>
                <span className="text-zinc-400">College: 8:30 AM–4:30 PM | Free: 6 PM–9 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-white">Saturday:</span>
                <span className="text-zinc-400">Mostly free for project work</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-white">Sunday:</span>
                <span className="text-zinc-400">Family & personal rest time</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Holidays */}
        {step === 4 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-zinc-300 font-medium">How do you normally prefer spending free days / holidays?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Study', 'Projects', 'Family', 'Friends', 'Hobbies', 'Rest', 'Travel', 'Mixed'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHolidayCategory(cat)}
                  className={`p-3 rounded-xl border font-bold text-center transition ${
                    holidayCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Banner prompt */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 text-center">
          "These are your usual patterns. You can change them anytime."
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold text-xs hover:scale-105 transition"
            >
              <Check className="w-4 h-4" />
              <span>Complete Setup & Launch Assistant</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
