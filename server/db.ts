import fs from 'fs';
import path from 'path';
import { hashPassword } from './services/auth';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  college: string;
  department: string;
  year_of_study: string;
  wake_time: string; // "07:00"
  sleep_time: string; // "23:00"
  preferred_work_period: 'morning' | 'afternoon' | 'evening' | 'night';
  usual_busy_windows: { day: string; start: string; end: string; label: string }[];
  usual_free_windows: { day: string; start: string; end: string }[];
  weekend_pattern: { saturday: string; sunday: string };
  holiday_category: string;
  default_buffer_mins: number;
  personalization_enabled: boolean;
}

export interface AvailabilityOverride {
  id: string;
  user_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "18:00"
  end_time: string; // "21:00"
  is_available: boolean;
  reason?: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  estimated_duration_mins: number;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Academic' | 'Project' | 'Personal' | 'Work';
  deadline: string; // ISO string
  estimated_duration: number; // minutes
  actual_duration: number; // minutes
  remaining_duration: number; // minutes
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  priority_score: number; // 0 - 100
  priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  preferred_work_windows?: string[];
  status: 'planned' | 'scheduled' | 'in_progress' | 'partially_completed' | 'completed' | 'postponed' | 'overdue' | 'cancelled';
  progress_percentage: number;
  planning_buffer: number; // minutes
  delay_reason?: string;
  notes?: string;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface FixedEvent {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  category: string;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  duration_mins: number;
  block_type: 'task' | 'event' | 'break' | 'free';
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  priority_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string;
  start_time: string;
  end_time?: string;
  actual_duration_mins: number;
  difficulty_rating?: 'Easy' | 'Moderate' | 'Difficult';
  took_longer_than_expected?: boolean;
  notes?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'upcoming' | 'start' | 'motivation' | 'no_response' | 'reason_prompt' | 'deadline_risk' | 'schedule_updated' | 'completion' | 'overload' | 'reflection';
  is_read: boolean;
  task_id?: string;
  created_at: string;
  action_url?: string;
}

export interface Insight {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  details: string;
  category: 'estimation' | 'timing' | 'completion' | 'workload';
  created_at: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  profiles: UserProfile[];
  overrides: AvailabilityOverride[];
  tasks: Task[];
  subtasks: Subtask[];
  events: FixedEvent[];
  schedule: ScheduleBlock[];
  focus_sessions: FocusSession[];
  notifications: AppNotification[];
  insights: Insight[];
}

const DB_FILE = path.join(__dirname, 'focusflow_db.json');

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getTomorrowString = () => getTodayString(1);
const getFridayString = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
};
const getSundayString = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (0 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
};

export const getInitialData = (): DatabaseSchema => {
  const today = getTodayString();
  const tomorrow = getTomorrowString();
  const friday = getFridayString();
  const sunday = getSundayString();

  const userId = 'u_arun';

  return {
    users: [
      {
        id: userId,
        name: 'Arun',
        email: 'arun@nit.edu',
        password_hash: hashPassword('password123'),
        created_at: new Date().toISOString()
      },
      {
        id: 'u_demo',
        name: 'Demo Student',
        email: 'demo@focusflow.ai',
        password_hash: hashPassword('focusflow2026'),
        created_at: new Date().toISOString()
      }
    ],
    profiles: [
      {
        id: 'p_arun',
        user_id: userId,
        name: 'Arun',
        age: 21,
        college: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        year_of_study: '3rd Year',
        wake_time: '07:00',
        sleep_time: '23:00',
        preferred_work_period: 'evening',
        usual_busy_windows: [
          { day: 'Monday', start: '08:30', end: '16:30', label: 'College Lectures' },
          { day: 'Tuesday', start: '08:30', end: '16:30', label: 'College Lectures' },
          { day: 'Wednesday', start: '08:30', end: '16:30', label: 'College Lectures' },
          { day: 'Thursday', start: '08:30', end: '16:30', label: 'College Lectures' },
          { day: 'Friday', start: '08:30', end: '16:30', label: 'College Lectures' },
        ],
        usual_free_windows: [
          { day: 'Monday', start: '18:00', end: '21:00' },
          { day: 'Tuesday', start: '18:00', end: '21:00' },
          { day: 'Wednesday', start: '18:00', end: '21:00' },
          { day: 'Thursday', start: '18:00', end: '21:00' },
          { day: 'Friday', start: '18:00', end: '21:00' },
          { day: 'Saturday', start: '10:00', end: '20:00' },
          { day: 'Sunday', start: '14:00', end: '19:00' },
        ],
        weekend_pattern: { saturday: 'Mostly free for projects & personal study', sunday: 'Family & Rest' },
        holiday_category: 'Mixed',
        default_buffer_mins: 15,
        personalization_enabled: true,
      }
    ],
    overrides: [],
    events: [
      {
        id: 'e_1',
        user_id: userId,
        title: 'College Cultural Fest Committee Meeting',
        date: today,
        start_time: '16:00',
        end_time: '18:00',
        category: 'College Event'
      }
    ],
    tasks: [
      {
        id: 't_1',
        user_id: userId,
        title: 'DBMS Assignment',
        description: 'Complete ER diagram design and SQL query normalization exercises.',
        category: 'Academic',
        deadline: `${tomorrow}T23:59:00`,
        estimated_duration: 120, // 2 hours
        actual_duration: 0,
        remaining_duration: 120,
        importance: 'HIGH',
        difficulty: 'Moderate',
        priority_score: 92,
        priority_level: 'CRITICAL',
        preferred_work_windows: ['evening'],
        status: 'planned',
        progress_percentage: 0,
        planning_buffer: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't_2',
        user_id: userId,
        title: 'Python Assignment',
        description: 'Implement pandas data processing script and unit tests.',
        category: 'Academic',
        deadline: `${friday}T23:59:00`,
        estimated_duration: 90, // 1.5 hours
        actual_duration: 0,
        remaining_duration: 90,
        importance: 'MEDIUM',
        difficulty: 'Easy',
        priority_score: 72,
        priority_level: 'HIGH',
        preferred_work_windows: ['evening'],
        status: 'planned',
        progress_percentage: 0,
        planning_buffer: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't_3',
        user_id: userId,
        title: 'AI Project Prototype',
        description: 'Train local baseline sentiment model and set up FastAPI route.',
        category: 'Project',
        deadline: `${sunday}T23:59:00`,
        estimated_duration: 240, // 4 hours
        actual_duration: 0,
        remaining_duration: 240,
        importance: 'HIGH',
        difficulty: 'Difficult',
        priority_score: 65,
        priority_level: 'MEDIUM',
        preferred_work_windows: ['weekend', 'evening'],
        status: 'planned',
        progress_percentage: 0,
        planning_buffer: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    subtasks: [
      { id: 'st_1', task_id: 't_1', title: 'Draft ER Diagram', estimated_duration_mins: 45, completed: false },
      { id: 'st_2', task_id: 't_1', title: 'Write 3NF SQL Queries', estimated_duration_mins: 75, completed: false },
      { id: 'st_3', task_id: 't_2', title: 'Clean CSV Dataset with Pandas', estimated_duration_mins: 40, completed: false },
      { id: 'st_4', task_id: 't_2', title: 'Write PyTest test cases', estimated_duration_mins: 50, completed: false },
    ],
    schedule: [],
    focus_sessions: [],
    notifications: [
      {
        id: 'n_1',
        user_id: userId,
        title: 'FocusFlow Activated',
        message: 'Good morning Arun! DBMS Assignment is your highest priority today.',
        type: 'upcoming',
        is_read: false,
        created_at: new Date().toISOString(),
      }
    ],
    insights: [
      {
        id: 'i_1',
        user_id: userId,
        title: 'Evening Peak Focus',
        summary: 'You complete difficult tasks 35% more consistently between 6:00 PM and 9:00 PM.',
        details: 'Based on your recent study history, evening blocks show higher focus retention.',
        category: 'timing',
        created_at: new Date().toISOString()
      },
      {
        id: 'i_2',
        user_id: userId,
        title: 'Technical Task Buffering',
        summary: 'Programming & database tasks often take ~20-30 minutes longer than initial estimates.',
        details: 'FocusFlow automatically includes a 20-minute safety buffer for your academic technical tasks.',
        category: 'estimation',
        created_at: new Date().toISOString()
      }
    ]
  };
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading db file, re-initializing...', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  public save(newData?: DatabaseSchema): void {
    if (newData) this.data = newData;
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public resetDemoData(): DatabaseSchema {
    const fresh = getInitialData();
    this.save(fresh);
    return fresh;
  }
}

export const db = new Database();
