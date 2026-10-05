export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  college: string;
  department: string;
  year_of_study: string;
  wake_time: string;
  sleep_time: string;
  preferred_work_period: 'morning' | 'afternoon' | 'evening' | 'night';
  usual_busy_windows: { day: string; start: string; end: string; label: string }[];
  usual_free_windows: { day: string; start: string; end: string }[];
  weekend_pattern: { saturday: string; sunday: string };
  holiday_category: string;
  default_buffer_mins: number;
  personalization_enabled: boolean;
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
  title: string;
  description?: string;
  category: 'Academic' | 'Project' | 'Personal' | 'Work';
  deadline: string;
  estimated_duration: number; // minutes
  actual_duration: number; // minutes
  remaining_duration: number; // minutes
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  priority_score: number;
  priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  preferred_work_windows?: string[];
  status: 'planned' | 'scheduled' | 'in_progress' | 'partially_completed' | 'completed' | 'postponed' | 'overdue' | 'cancelled';
  progress_percentage: number;
  planning_buffer: number;
  delay_reason?: string;
  notes?: string;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  subtasks?: Subtask[];
}

export interface ScheduleBlock {
  id: string;
  task_id?: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  block_type: 'task' | 'event' | 'break' | 'free';
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  priority_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OverloadAlert {
  isOverloaded: boolean;
  plannedMinutes: number;
  availableMinutes: number;
  excessMinutes: number;
  message: string;
  recommendations: string[];
}

export interface DeadlineRisk {
  taskId: string;
  taskTitle: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  remainingMinutes: number;
  availableMinutesBeforeDeadline: number;
  reason: string;
}

export interface ScheduleResponse {
  schedule: ScheduleBlock[];
  overload: OverloadAlert;
  deadlineRisks: DeadlineRisk[];
  whatShouldIDoNow?: {
    task: Task;
    recommendedDurationMins: number;
    reason: string;
    block?: ScheduleBlock;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'upcoming' | 'start' | 'motivation' | 'no_response' | 'reason_prompt' | 'deadline_risk' | 'schedule_updated' | 'completion' | 'overload' | 'reflection';
  is_read: boolean;
  task_id?: string;
  created_at: string;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: 'estimation' | 'timing' | 'completion' | 'workload';
  created_at: string;
}

export interface AIUtteranceResponse {
  intent: string;
  task?: {
    title?: string;
    category?: 'Academic' | 'Project' | 'Personal' | 'Work';
    deadline?: string;
    estimated_duration_minutes?: number;
    difficulty?: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
    importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  missing_information?: string[];
  conversational_reply: string;
  suggested_actions?: string[];
}
