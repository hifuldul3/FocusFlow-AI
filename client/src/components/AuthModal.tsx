import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Lock, Mail, User, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, ScheduleResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, profile: UserProfile, schedule: ScheduleResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(loginEmail || email || 'arun@nit.edu', loginPassword || password || 'password123');
      setIsLoading(false);
      onAuthSuccess(res.user, res.profile, res.schedule);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Invalid email or password');
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.register({
        name,
        email,
        password,
        college,
        department,
        year_of_study: yearOfStudy
      });
      setIsLoading(false);
      onAuthSuccess(res.user, res.profile, res.schedule);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 border-emerald-500/40 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Student Account Access</h3>
              <p className="text-[11px] text-zinc-400">FocusFlow AI Session Authentication</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROMINENT INSTANT GUEST ACCESS BUTTON */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-zinc-900 to-teal-500/20 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Instant Testing Access
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              No Typing Needed
            </span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Click below for immediate demo access with Arun's pre-loaded student schedule and active assignments.
          </p>
          <button
            type="button"
            onClick={() => handleLogin('arun@nit.edu', 'password123')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>Launch Instant Demo Access (Student Arun)</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-bold">
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'login' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In with Email
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'register' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arun@nit.edu"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleLogin()}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 border border-zinc-700 transition"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Student Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@college.edu"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1">College</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="IIT Madras"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Electrical Engg"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
            >
              {isLoading ? 'Creating Account...' : 'Register & Initialize Assistant'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
