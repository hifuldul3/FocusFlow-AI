import React, { useState } from 'react';
import { Mic, Bell, Sparkles, LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { AppNotification } from '../types';

interface NavbarProps {
  user: any;
  userName: string;
  notifications: AppNotification[];
  onOpenVoiceModal: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userName,
  notifications,
  onOpenVoiceModal,
  onOpenNotifications,
  onOpenAuthModal,
  onLogout,
  onToggleSidebar
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
        >
          <UserIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 fill-zinc-950" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white">
              FocusFlow <span className="text-emerald-400 font-extrabold">AI</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2 border border-emerald-500/20 font-medium">
              Adaptive Student Assistant
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Primary Voice CTA */}
        <button
          onClick={onOpenVoiceModal}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Mic className="w-4 h-4 group-hover:animate-bounce" />
          <span>Talk to FocusFlow</span>
          <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping opacity-75" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account / Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {userName ? userName.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:block text-xs">
              <span className="font-bold text-zinc-200 block leading-tight">{userName || 'Arun'}</span>
              <span className="text-[10px] text-zinc-400 block leading-tight">
                {user?.email ? user.email : 'arun@nit.edu'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-zinc-800">
                <p className="font-bold text-white">{userName}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'arun@nit.edu'}</p>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenAuthModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 font-medium"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Switch / Sign In Account</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
