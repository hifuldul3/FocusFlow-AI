import {
  UserProfile,
  Task,
  ScheduleResponse,
  AppNotification,
  Insight,
  AIUtteranceResponse
} from '../types';

const API_BASE = '/api';

const getHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem('focusflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: any; profile: UserProfile; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.error || 'Login failed');
    }
    const res = await r.json();
    localStorage.setItem('focusflow_token', res.token);
    return res;
  },

  register: async (userData: any): Promise<{ token: string; user: any; profile: UserProfile; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.error || 'Registration failed');
    }
    const res = await r.json();
    localStorage.setItem('focusflow_token', res.token);
    return res;
  },

  getMe: async (): Promise<{ user: any; profile: UserProfile }> => {
    const r = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Unauthenticated');
    return r.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getHeaders() });
    localStorage.removeItem('focusflow_token');
  },

  // Profile
  getProfile: async (): Promise<UserProfile> => {
    const r = await fetch(`${API_BASE}/profile`, { headers: getHeaders() });
    return r.json();
  },
  updateProfile: async (profile: Partial<UserProfile>): Promise<{ profile: UserProfile; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    return r.json();
  },

  // Availability Overrides
  addAvailabilityException: async (override: { date: string; start_time: string; end_time: string; is_available: boolean; reason?: string }): Promise<{ override: any; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/availability/exceptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(override)
    });
    return r.json();
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    const r = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
    return r.json();
  },
  createTask: async (task: Partial<Task>): Promise<{ task: Task; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    return r.json();
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<{ task: Task; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return r.json();
  },
  deleteTask: async (id: string): Promise<{ schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE', headers: getHeaders() });
    return r.json();
  },

  // Task Actions
  completeTask: async (id: string, actual_duration?: number): Promise<{ task: Task; savedMins: number; schedule: ScheduleResponse; recommendation: string }> => {
    const r = await fetch(`${API_BASE}/tasks/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ actual_duration })
    });
    return r.json();
  },
  partialCompleteTask: async (id: string, progress_percentage: number, remaining_duration: number): Promise<{ task: Task; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/tasks/${id}/partial`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ progress_percentage, remaining_duration })
    });
    return r.json();
  },
  triggerRecoveryMode: async (id: string, reason: string, notes?: string): Promise<{ message: string } & ScheduleResponse> => {
    const r = await fetch(`${API_BASE}/tasks/${id}/replan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, notes })
    });
    return r.json();
  },

  // Schedule
  getSchedule: async (date?: string): Promise<ScheduleResponse> => {
    const r = await fetch(`${API_BASE}/schedule${date ? `?date=${date}` : ''}`, { headers: getHeaders() });
    return r.json();
  },

  // AI Assistant
  processUtterance: async (utterance: string, history: any[] = []): Promise<AIUtteranceResponse> => {
    const r = await fetch(`${API_BASE}/ai/process-utterance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ utterance, history })
    });
    return r.json();
  },
  decomposeTask: async (title: string): Promise<{ subtasks: { title: string; estimated_duration_mins: number }[] }> => {
    const r = await fetch(`${API_BASE}/ai/decompose-task`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title })
    });
    return r.json();
  },

  // Insights
  getInsights: async (): Promise<Insight[]> => {
    const r = await fetch(`${API_BASE}/insights`, { headers: getHeaders() });
    return r.json();
  },
  getEndOfDayReview: async (): Promise<any> => {
    const r = await fetch(`${API_BASE}/insights/end-of-day`, { headers: getHeaders() });
    return r.json();
  },

  // Focus Session
  startFocus: async (task_id: string): Promise<{ session: any }> => {
    const r = await fetch(`${API_BASE}/focus/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ task_id })
    });
    return r.json();
  },
  endFocus: async (sessionData: { session_id?: string; actual_duration_mins: number; difficulty_rating?: string; took_longer_than_expected?: boolean }): Promise<{ session: any; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/focus/end`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sessionData)
    });
    return r.json();
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    const r = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return r.json();
  },
  markNotificationRead: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST', headers: getHeaders() });
  },

  // Demo Mode Triggers
  resetDemo: async (): Promise<{ message: string; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/demo/reset`, { method: 'POST', headers: getHeaders() });
    return r.json();
  },
  simulateMissedTask: async (): Promise<{ message: string } & ScheduleResponse> => {
    const r = await fetch(`${API_BASE}/demo/simulate-missed-task`, { method: 'POST', headers: getHeaders() });
    return r.json();
  },
  simulateEarlyCompletion: async (): Promise<{ message: string; schedule: ScheduleResponse }> => {
    const r = await fetch(`${API_BASE}/demo/simulate-early-completion`, { method: 'POST', headers: getHeaders() });
    return r.json();
  }
};
