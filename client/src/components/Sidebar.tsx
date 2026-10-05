import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Zap,
  LineChart,
  Bell,
  User,
  BotMessageSquare,
  Sparkles
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'tasks'
  | 'schedule'
  | 'focus'
  | 'insights'
  | 'notifications'
  | 'profile'
  | 'assistant';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
  unreadNotificationsCount = 0
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'My Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus Mode', icon: <Zap className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <LineChart className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Profile & Routine', icon: <User className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <BotMessageSquare className="w-4 h-4" /> }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="mb-6 px-3">
        <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Navigation</p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-emerald-500 text-zinc-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Adaptive Loop Info Card */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Adaptive Loop</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          Plan → Track → Detect Change → Replan → Learn
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-zinc-800/80 bg-zinc-950/60 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-800 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
