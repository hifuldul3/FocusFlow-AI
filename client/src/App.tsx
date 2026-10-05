import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { DemoControlBar } from './components/DemoControlBar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { TaskExtractionPreviewModal } from './components/TaskExtractionPreviewModal';
import { RecoveryModal } from './components/RecoveryModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AuthModal } from './components/AuthModal';

import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { SchedulePage } from './pages/SchedulePage';
import { FocusPage } from './pages/FocusPage';
import { InsightsPage } from './pages/InsightsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAssistantPage } from './pages/AIAssistantPage';

import { api } from './services/api';
import { UserProfile, Task, ScheduleResponse, AppNotification, Insight } from './types';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Arun', email: 'arun@nit.edu' });
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);

  // App Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Modals state
  const [isOpenVoiceModal, setIsOpenVoiceModal] = useState(false);
  const [extractedTaskData, setExtractedTaskData] = useState<any>(null);
  const [recoveryTask, setRecoveryTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isOpenOnboarding, setIsOpenOnboarding] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('focusflow_token');
      if (token) {
        try {
          const me = await api.getMe();
          setCurrentUser(me.user);
          setProfile(me.profile);
        } catch (e) {
          // Fallback
        }
      }

      const [prof, tList, sched, notifs, ins] = await Promise.all([
        api.getProfile(),
        api.getTasks(),
        api.getSchedule(),
        api.getNotifications(),
        api.getInsights()
      ]);
      setProfile(prof);
      setTasks(tList);
      setScheduleData(sched);
      setNotifications(notifs);
      setInsights(ins);
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleScheduleUpdated = (newSchedule: ScheduleResponse) => {
    setScheduleData(newSchedule);
    api.getTasks().then(setTasks);
    api.getNotifications().then(setNotifications);
    api.getInsights().then(setInsights);
  };

  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setActivePage('focus');
  };

  const handleAuthSuccess = (user: any, userProfile: UserProfile, schedule: ScheduleResponse) => {
    setCurrentUser(user);
    setProfile(userProfile);
    setScheduleData(schedule);
    api.getTasks().then(setTasks);
    api.getNotifications().then(setNotifications);
    api.getInsights().then(setInsights);
    showToast(`Logged in successfully as ${user.name} (${user.email})!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser({ name: 'Arun', email: 'arun@nit.edu' });
    loadAllData();
    showToast('Signed out of account.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Hackathon Demo Control Bar */}
      <DemoControlBar
        onScheduleUpdated={handleScheduleUpdated}
        onShowMessage={(msg) => showToast(msg)}
        onOpenAuthModal={() => setIsOpenAuthModal(true)}
      />

      {/* Navbar */}
      <Navbar
        user={currentUser}
        userName={profile?.name || currentUser?.name || 'Arun'}
        notifications={notifications}
        onOpenVoiceModal={() => setIsOpenVoiceModal(true)}
        onOpenNotifications={() => setActivePage('notifications')}
        onOpenAuthModal={() => setIsOpenAuthModal(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
          unreadNotificationsCount={notifications.filter((n) => !n.is_read).length}
        />

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-xl flex items-center justify-between animate-fade-in">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-emerald-400 font-bold ml-4">
                Dismiss
              </button>
            </div>
          )}

          {activePage === 'dashboard' && profile && (
            <DashboardPage
              profile={profile}
              scheduleData={scheduleData}
              tasks={tasks}
              insights={insights}
              onStartFocus={handleStartFocus}
              onOpenVoice={() => setIsOpenVoiceModal(true)}
              onOpenRecovery={(t) => setRecoveryTask(t)}
              onSelectPage={setActivePage}
            />
          )}

          {activePage === 'tasks' && (
            <TasksPage
              tasks={tasks}
              onStartFocus={handleStartFocus}
              onOpenRecovery={(t) => setRecoveryTask(t)}
              onOpenVoice={() => setIsOpenVoiceModal(true)}
              onScheduleUpdated={handleScheduleUpdated}
            />
          )}

          {activePage === 'schedule' && profile && (
            <SchedulePage
              scheduleData={scheduleData}
              profile={profile}
              onScheduleUpdated={handleScheduleUpdated}
              onOpenVoice={() => setIsOpenVoiceModal(true)}
            />
          )}

          {activePage === 'focus' && (
            <FocusPage
              currentTask={focusTask || (tasks.length > 0 ? tasks[0] : null)}
              onEndFocus={handleScheduleUpdated}
              onOpenVoice={() => setIsOpenVoiceModal(true)}
            />
          )}

          {activePage === 'insights' && (
            <InsightsPage insights={insights} tasks={tasks} />
          )}

          {activePage === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onRefreshNotifications={() => api.getNotifications().then(setNotifications)}
            />
          )}

          {activePage === 'profile' && profile && (
            <ProfilePage
              profile={profile}
              onProfileUpdated={(upProf, sched) => {
                setProfile(upProf);
                handleScheduleUpdated(sched);
                showToast('Profile and Routine updated successfully!');
              }}
              onResetDemo={async () => {
                const res = await api.resetDemo();
                handleScheduleUpdated(res.schedule);
                showToast('Demo data reset back to initial student state.');
              }}
            />
          )}

          {activePage === 'assistant' && (
            <AIAssistantPage
              onScheduleUpdated={handleScheduleUpdated}
              onExtractedTask={(tData) => setExtractedTaskData(tData)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isOpenAuthModal}
        onClose={() => setIsOpenAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <VoiceAssistantModal
        isOpen={isOpenVoiceModal}
        onClose={() => setIsOpenVoiceModal(false)}
        onScheduleUpdated={handleScheduleUpdated}
        onExtractedTask={(tData) => {
          setIsOpenVoiceModal(false);
          setExtractedTaskData(tData);
        }}
      />

      <TaskExtractionPreviewModal
        taskData={extractedTaskData}
        onClose={() => setExtractedTaskData(null)}
        onTaskCreated={(sched) => {
          handleScheduleUpdated(sched);
          showToast('New Task created and added to schedule!');
        }}
      />

      <RecoveryModal
        task={recoveryTask}
        onClose={() => setRecoveryTask(null)}
        onScheduleUpdated={(sched) => {
          handleScheduleUpdated(sched);
          showToast('Recovery Mode complete! Schedule automatically replanned.');
        }}
      />

      <OnboardingWizard
        isOpen={isOpenOnboarding}
        onComplete={(upProf, sched) => {
          setProfile(upProf);
          handleScheduleUpdated(sched);
          setIsOpenOnboarding(false);
          showToast('Welcome to FocusFlow AI!');
        }}
      />
    </div>
  );
};
