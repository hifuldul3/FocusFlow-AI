import React from 'react';
import { Bell, Check, Trash2, ShieldAlert, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../services/api';
import { notificationService } from '../services/notification';

interface NotificationsPageProps {
  notifications: AppNotification[];
  onRefreshNotifications: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onRefreshNotifications
}) => {
  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    onRefreshNotifications();
  };

  const handleTestBrowserNotification = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.showBrowserNotification(
        'FocusFlow AI Notification',
        'Your DBMS session starts in 10 minutes!'
      );
      notificationService.playTone('alert');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Contextual, non-intrusive smart alerts</p>
        </div>

        <button
          onClick={handleTestBrowserNotification}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 font-semibold text-xs hover:border-emerald-500/40 transition"
        >
          <Bell className="w-4 h-4" />
          <span>Test Browser Notification</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-card p-8 text-center text-zinc-400 text-xs">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`glass-card p-4 flex items-start justify-between gap-4 border cursor-pointer transition ${
                n.is_read ? 'opacity-50 border-zinc-800' : 'border-emerald-500/30 bg-emerald-950/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{n.title}</h4>
                  <p className="text-xs text-zinc-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
