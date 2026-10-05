import { db, Task, ScheduleBlock, AvailabilityOverride, FixedEvent, UserProfile } from '../db';
import { calculateTaskPriority } from './priority';
import { format, parse, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';

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

export interface ScheduleGenerationResult {
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

// Convert "HH:mm" to total minutes from midnight
const timeToMins = (timeStr: string): number => {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Convert minutes from midnight back to "HH:mm"
const minsToTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const generateSchedule = (dateStr?: string, userId: string = 'u_arun'): ScheduleGenerationResult => {
  const data = db.get();
  const date = dateStr || new Date().toISOString().split('T')[0];

  // User Profile
  const profile = data.profiles.find((p) => p.user_id === userId) || {
    id: `p_${userId}`,
    user_id: userId,
    name: 'Student',
    college: 'University',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    wake_time: '07:00',
    sleep_time: '23:00',
    preferred_work_period: 'evening' as const,
    usual_busy_windows: [{ day: 'Monday', start: '08:30', end: '16:30', label: 'College Lectures' }],
    usual_free_windows: [{ day: 'Monday', start: '18:00', end: '21:00' }],
    weekend_pattern: { saturday: 'Free', sunday: 'Rest' },
    holiday_category: 'Mixed',
    default_buffer_mins: 15,
    personalization_enabled: true
  };

  // 1. Determine Availability Slots for target date and target user
  const dayOverrides = data.overrides.filter((o) => o.user_id === userId && o.date === date);

  let freeTimeRanges: { start: number; end: number }[] = [];
  let busyRanges: { start: number; end: number; label: string }[] = [];

  const wakeMins = timeToMins(profile.wake_time || '07:00');
  const sleepMins = timeToMins(profile.sleep_time || '23:00');

  if (dayOverrides.length > 0) {
    for (const ov of dayOverrides) {
      if (ov.is_available) {
        freeTimeRanges.push({ start: timeToMins(ov.start_time), end: timeToMins(ov.end_time) });
      } else {
        busyRanges.push({ start: timeToMins(ov.start_time), end: timeToMins(ov.end_time), label: ov.reason || 'Unavailable' });
      }
    }
  } else {
    for (const fw of profile.usual_free_windows || []) {
      freeTimeRanges.push({ start: timeToMins(fw.start), end: timeToMins(fw.end) });
    }
    for (const bw of profile.usual_busy_windows || []) {
      busyRanges.push({ start: timeToMins(bw.start), end: timeToMins(bw.end), label: bw.label });
    }
  }

  // 2. Add Fixed Events for today and target user
  const dayEvents = data.events.filter((e) => e.user_id === userId && e.date === date);
  for (const ev of dayEvents) {
    busyRanges.push({
      start: timeToMins(ev.start_time),
      end: timeToMins(ev.end_time),
      label: ev.title
    });
  }

  // Calculate available free time total
  const refinedFreeRanges: { start: number; end: number }[] = [];
  for (const free of freeTimeRanges) {
    let currentStart = free.start;
    const sortedBusy = [...busyRanges].sort((a, b) => a.start - b.start);

    for (const busy of sortedBusy) {
      if (busy.end <= currentStart || busy.start >= free.end) continue;
      if (busy.start > currentStart) {
        refinedFreeRanges.push({ start: currentStart, end: busy.start });
      }
      currentStart = Math.max(currentStart, busy.end);
    }
    if (currentStart < free.end) {
      refinedFreeRanges.push({ start: currentStart, end: free.end });
    }
  }

  const totalAvailableMins = refinedFreeRanges.reduce((acc, r) => acc + (r.end - r.start), 0);

  // 3. Get User's Active Tasks & Recalculate Priority
  const activeTasks = data.tasks.filter(
    (t) => t.user_id === userId && (t.status === 'planned' || t.status === 'scheduled' || t.status === 'in_progress' || t.status === 'partially_completed')
  );

  activeTasks.forEach((t) => {
    const p = calculateTaskPriority(t, totalAvailableMins / 60);
    t.priority_score = p.score;
    t.priority_level = p.level;
  });

  activeTasks.sort((a, b) => b.priority_score - a.priority_score);

  const totalPlannedMins = activeTasks.reduce((acc, t) => acc + t.remaining_duration, 0);

  // 4. Build Schedule Blocks
  const scheduleBlocks: ScheduleBlock[] = [];

  // Add Busy blocks
  for (const busy of busyRanges) {
    scheduleBlocks.push({
      id: `sb_busy_${busy.start}`,
      user_id: userId,
      title: busy.label,
      date,
      start_time: minsToTime(busy.start),
      end_time: minsToTime(busy.end),
      duration_mins: busy.end - busy.start,
      block_type: 'event',
      status: 'scheduled'
    });
  }

  // Allocate tasks into free slots
  const currentSlotPointer = refinedFreeRanges.map((r) => r.start);

  for (const task of activeTasks) {
    let remainingToSchedule = task.remaining_duration;
    if (profile.personalization_enabled && task.planning_buffer) {
      remainingToSchedule += Math.min(task.planning_buffer, 15);
    }

    for (let i = 0; i < refinedFreeRanges.length && remainingToSchedule > 0; i++) {
      const slot = refinedFreeRanges[i];
      const availStart = currentSlotPointer[i];

      if (availStart >= slot.end) continue;

      const slotCap = slot.end - availStart;
      if (slotCap <= 15) continue;

      const blockDuration = Math.min(remainingToSchedule, slotCap);

      scheduleBlocks.push({
        id: `sb_task_${task.id}_${availStart}`,
        user_id: userId,
        task_id: task.id,
        title: task.title,
        date,
        start_time: minsToTime(availStart),
        end_time: minsToTime(availStart + blockDuration),
        duration_mins: blockDuration,
        block_type: 'task',
        status: task.status === 'in_progress' ? 'in_progress' : 'scheduled',
        priority_level: task.priority_level
      });

      currentSlotPointer[i] += blockDuration + 10;
      remainingToSchedule -= blockDuration;

      if (task.status === 'planned') {
        task.status = 'scheduled';
      }
    }
  }

  scheduleBlocks.sort((a, b) => timeToMins(a.start_time) - timeToMins(b.start_time));

  // Save schedule blocks for target user
  data.schedule = [...data.schedule.filter((s) => s.user_id !== userId), ...scheduleBlocks];
  db.save(data);

  // 5. Workload Overload Check
  const excessMinutes = Math.max(0, totalPlannedMins - totalAvailableMins);
  const isOverloaded = excessMinutes > 30;

  const overload: OverloadAlert = {
    isOverloaded,
    plannedMinutes: totalPlannedMins,
    availableMinutes: totalAvailableMins,
    excessMinutes,
    message: isOverloaded
      ? `Your day is overloaded by approximately ${(excessMinutes / 60).toFixed(1)} hours.`
      : `Workload is balanced for today. You have ${totalAvailableMins} mins available.`,
    recommendations: isOverloaded
      ? [
          'Prioritize your CRITICAL tasks.',
          'Postpone lower priority assignments to tomorrow.',
          'Split large project tasks into smaller 45-minute sessions.',
          'Add an additional evening availability window if needed.'
        ]
      : ['Stick to scheduled focus blocks and take regular 10-minute breaks.']
  };

  // 6. Deadline Risk Check
  const deadlineRisks: DeadlineRisk[] = [];
  for (const task of activeTasks) {
    if (!task.deadline) continue;
    const deadlineDate = parseISO(task.deadline);
    const now = new Date();
    const hoursLeft = Math.max(0, (deadlineDate.getTime() - now.getTime()) / (1000 * 3600));
    const freeHoursBeforeDeadline = Math.min(hoursLeft, totalAvailableMins / 60);

    if (task.remaining_duration / 60 > freeHoursBeforeDeadline) {
      deadlineRisks.push({
        taskId: task.id,
        taskTitle: task.title,
        riskLevel: task.remaining_duration / 60 > freeHoursBeforeDeadline * 1.3 ? 'CRITICAL' : 'HIGH',
        remainingMinutes: task.remaining_duration,
        availableMinutesBeforeDeadline: Math.round(freeHoursBeforeDeadline * 60),
        reason: `Requires ${(task.remaining_duration / 60).toFixed(1)} hours, but only ${freeHoursBeforeDeadline.toFixed(1)} free hours remain before deadline.`
      });
    }
  }

  // 7. "WHAT SHOULD I DO NOW?"
  let whatShouldIDoNow: ScheduleGenerationResult['whatShouldIDoNow'];
  if (activeTasks.length > 0) {
    const topTask = activeTasks[0];
    const topBlock = scheduleBlocks.find((b) => b.task_id === topTask.id);

    whatShouldIDoNow = {
      task: topTask,
      recommendedDurationMins: Math.min(topTask.remaining_duration, 45),
      reason: `Highest priority (${topTask.priority_score}/100, ${topTask.priority_level}). Deadline ${
        topTask.deadline ? format(parseISO(topTask.deadline), 'MMM d, h:mm a') : 'soon'
      }. ${topTask.remaining_duration} mins remaining.`,
      block: topBlock
    };
  }

  return {
    schedule: scheduleBlocks,
    overload,
    deadlineRisks,
    whatShouldIDoNow
  };
};

export const handleRecoveryMode = (taskId: string, reason: string, customNotes?: string, userId: string = 'u_arun') => {
  const data = db.get();
  const task = data.tasks.find((t) => t.id === taskId);
  if (!task) return generateSchedule(undefined, userId);

  task.delay_reason = reason;
  task.status = 'postponed';
  task.notes = customNotes ? `${task.notes || ''}\nRecovery note: ${customNotes}` : task.notes;

  switch (reason) {
    case 'Too difficult':
      task.difficulty = 'Difficult';
      task.planning_buffer = (task.planning_buffer || 15) + 20;
      break;
    case 'Not enough time':
      task.remaining_duration = Math.round(task.remaining_duration * 1.1);
      break;
    case 'Something came up':
      const now = new Date();
      const currentHour = now.getHours();
      data.overrides.push({
        id: `ov_${Date.now()}`,
        user_id: userId,
        date: now.toISOString().split('T')[0],
        start_time: `${currentHour.toString().padStart(2, '0')}:00`,
        end_time: `${(currentHour + 2).toString().padStart(2, '0')}:00`,
        is_available: false,
        reason: 'Unplanned interruption'
      });
      break;
    case 'Couldn\'t focus':
      task.planning_buffer = 10;
      break;
    default:
      break;
  }

  db.save(data);
  return generateSchedule(undefined, userId);
};
