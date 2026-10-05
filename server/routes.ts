import { Router } from 'express';
import { db, Task, Subtask, FocusSession, AppNotification } from './db';
import { generateSchedule, handleRecoveryMode } from './services/scheduler';
import { processUserUtterance, decomposeTaskWithAI } from './services/ai';
import { generateProductivityInsights, generateEndOfDayReview } from './services/insights';
import { calculateTaskPriority } from './services/priority';
import { hashPassword, generateSessionToken, getUserIdFromToken, invalidateSessionToken } from './services/auth';

export const router = Router();

// Helper to resolve current user ID from request header
const getUserId = (req: any): string => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const uid = getUserIdFromToken(token);
    if (uid) return uid;
  }
  return 'u_arun'; // Default demo student fallback
};

// --- AUTHENTICATION ROUTES ---
router.post('/auth/register', (req, res) => {
  const { name, email, password, college, department, year_of_study } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const data = db.get();
  const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = `u_${Date.now()}`;
  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString()
  };

  const newProfile = {
    id: `p_${userId}`,
    user_id: userId,
    name,
    college: college || 'University',
    department: department || 'General Studies',
    year_of_study: year_of_study || '1st Year',
    wake_time: '07:00',
    sleep_time: '23:00',
    preferred_work_period: 'evening' as const,
    usual_busy_windows: [{ day: 'Monday', start: '08:30', end: '16:30', label: 'College Lectures' }],
    usual_free_windows: [{ day: 'Monday', start: '18:00', end: '21:00' }],
    weekend_pattern: { saturday: 'Free for projects', sunday: 'Personal Rest' },
    holiday_category: 'Mixed',
    default_buffer_mins: 15,
    personalization_enabled: true
  };

  data.users.push(newUser);
  data.profiles.push(newProfile);
  db.save(data);

  const token = generateSessionToken(userId);
  const scheduleRes = generateSchedule(undefined, userId);

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    profile: newProfile,
    schedule: scheduleRes
  });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const data = db.get();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateSessionToken(user.id);
  const profile = data.profiles.find((p) => p.user_id === user.id) || {
    id: `p_${user.id}`,
    user_id: user.id,
    name: user.name,
    college: 'University',
    department: 'Engineering',
    year_of_study: '3rd Year',
    wake_time: '07:00',
    sleep_time: '23:00',
    preferred_work_period: 'evening' as const,
    usual_busy_windows: [],
    usual_free_windows: [],
    weekend_pattern: { saturday: 'Free', sunday: 'Rest' },
    holiday_category: 'Mixed',
    default_buffer_mins: 15,
    personalization_enabled: true
  };

  const scheduleRes = generateSchedule(undefined, user.id);

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
    profile,
    schedule: scheduleRes
  });
});

router.get('/auth/me', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const user = data.users.find((u) => u.id === userId);
  const profile = data.profiles.find((p) => p.user_id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    profile
  });
});

router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    invalidateSessionToken(token);
  }
  res.json({ success: true });
});

// --- PROFILE & ROUTINE ---
router.get('/profile', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const profile = data.profiles.find((p) => p.user_id === userId);
  res.json(profile || data.profiles[0]);
});

router.put('/profile', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  let profile = data.profiles.find((p) => p.user_id === userId);

  if (!profile) {
    profile = {
      id: `p_${userId}`,
      user_id: userId,
      name: req.body.name || 'Student',
      college: req.body.college || 'University',
      department: req.body.department || 'Computer Science',
      year_of_study: req.body.year_of_study || '3rd Year',
      wake_time: req.body.wake_time || '07:00',
      sleep_time: req.body.sleep_time || '23:00',
      preferred_work_period: req.body.preferred_work_period || 'evening',
      usual_busy_windows: [],
      usual_free_windows: [],
      weekend_pattern: { saturday: 'Free', sunday: 'Rest' },
      holiday_category: 'Mixed',
      default_buffer_mins: 15,
      personalization_enabled: true
    };
    data.profiles.push(profile);
  } else {
    Object.assign(profile, req.body);
  }

  db.save(data);
  const scheduleRes = generateSchedule(undefined, userId);
  res.json({ profile, schedule: scheduleRes });
});

// --- AVAILABILITY ---
router.get('/availability', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const profile = data.profiles.find((p) => p.user_id === userId) || data.profiles[0];
  const userOverrides = data.overrides.filter((o) => o.user_id === userId);

  res.json({
    usual_free: profile.usual_free_windows,
    usual_busy: profile.usual_busy_windows,
    overrides: userOverrides
  });
});

router.post('/availability/exceptions', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const { date, start_time, end_time, is_available, reason } = req.body;
  const newOverride = {
    id: `ov_${Date.now()}`,
    user_id: userId,
    date: date || new Date().toISOString().split('T')[0],
    start_time: start_time || '18:00',
    end_time: end_time || '21:00',
    is_available: is_available !== undefined ? is_available : true,
    reason: reason || 'User override'
  };
  data.overrides.push(newOverride);
  db.save(data);

  const updatedSchedule = generateSchedule(newOverride.date, userId);
  res.json({ override: newOverride, schedule: updatedSchedule });
});

// --- TASKS ---
router.get('/tasks', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const userTasks = data.tasks.filter((t) => t.user_id === userId);
  const tasksWithSubtasks = userTasks.map((t) => ({
    ...t,
    subtasks: data.subtasks.filter((st) => st.task_id === t.id)
  }));
  res.json(tasksWithSubtasks);
});

router.post('/tasks', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const body = req.body;

  const priorityRes = calculateTaskPriority(body);

  const newTask: Task = {
    id: `t_${Date.now()}`,
    user_id: userId,
    title: body.title || 'Untitled Task',
    description: body.description || '',
    category: body.category || 'Academic',
    deadline: body.deadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    estimated_duration: body.estimated_duration || 60,
    actual_duration: 0,
    remaining_duration: body.estimated_duration || 60,
    importance: body.importance || 'HIGH',
    difficulty: body.difficulty || 'Moderate',
    priority_score: priorityRes.score,
    priority_level: priorityRes.level,
    preferred_work_windows: body.preferred_work_windows || ['evening'],
    status: 'planned',
    progress_percentage: 0,
    planning_buffer: body.planning_buffer || 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  data.tasks.unshift(newTask);

  if (body.subtasks && Array.isArray(body.subtasks)) {
    body.subtasks.forEach((st: any) => {
      data.subtasks.push({
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        task_id: newTask.id,
        title: typeof st === 'string' ? st : st.title,
        estimated_duration_mins: st.estimated_duration_mins || 30,
        completed: false
      });
    });
  }

  data.notifications.unshift({
    id: `n_${Date.now()}`,
    user_id: userId,
    title: 'New Task Added',
    message: `"${newTask.title}" added to your queue (${priorityRes.level} Priority).`,
    type: 'upcoming',
    is_read: false,
    task_id: newTask.id,
    created_at: new Date().toISOString()
  });

  db.save(data);
  const updatedSchedule = generateSchedule(undefined, userId);

  res.status(201).json({ task: newTask, schedule: updatedSchedule });
});

router.put('/tasks/:id', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const task = data.tasks.find((t) => t.id === req.params.id && t.user_id === userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body, { updated_at: new Date().toISOString() });

  const priorityRes = calculateTaskPriority(task);
  task.priority_score = priorityRes.score;
  task.priority_level = priorityRes.level;

  db.save(data);
  const scheduleRes = generateSchedule(undefined, userId);
  res.json({ task, schedule: scheduleRes });
});

router.delete('/tasks/:id', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  data.tasks = data.tasks.filter((t) => !(t.id === req.params.id && t.user_id === userId));
  data.subtasks = data.subtasks.filter((st) => st.task_id !== req.params.id);
  db.save(data);
  const scheduleRes = generateSchedule(undefined, userId);
  res.json({ success: true, schedule: scheduleRes });
});

// --- TASK LIFECYCLE ---
router.post('/tasks/:id/complete', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const task = data.tasks.find((t) => t.id === req.params.id && t.user_id === userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const actualDuration = req.body.actual_duration || task.estimated_duration - 25;

  task.status = 'completed';
  task.progress_percentage = 100;
  task.actual_duration = Math.max(10, actualDuration);
  task.remaining_duration = 0;
  task.completed_at = new Date().toISOString();

  const savedMins = task.estimated_duration - task.actual_duration;
  let notifMsg = `Great job! "${task.title}" is complete.`;
  if (savedMins > 0) {
    notifMsg += ` You finished ${savedMins} minutes earlier than expected!`;
  }

  data.notifications.unshift({
    id: `n_${Date.now()}`,
    user_id: userId,
    title: 'Task Completed!',
    message: notifMsg,
    type: 'completion',
    is_read: false,
    task_id: task.id,
    created_at: new Date().toISOString()
  });

  db.save(data);
  const updatedSchedule = generateSchedule(undefined, userId);

  res.json({
    task,
    savedMins,
    schedule: updatedSchedule,
    recommendation: 'You have 25 minutes of freed time available. Would you like to start your next priority or keep the time free?'
  });
});

router.post('/tasks/:id/partial', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const task = data.tasks.find((t) => t.id === req.params.id && t.user_id === userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { progress_percentage, remaining_duration } = req.body;
  task.status = 'partially_completed';
  task.progress_percentage = progress_percentage || 50;
  task.remaining_duration = remaining_duration !== undefined ? remaining_duration : Math.round(task.estimated_duration * 0.5);

  db.save(data);
  const updatedSchedule = generateSchedule(undefined, userId);

  res.json({ task, schedule: updatedSchedule });
});

router.post('/tasks/:id/replan', (req, res) => {
  const userId = getUserId(req);
  const { reason, notes } = req.body;
  const scheduleRes = handleRecoveryMode(req.params.id, reason || 'Too difficult', notes, userId);
  res.json({ message: 'Recovery mode activated and schedule replanned', ...scheduleRes });
});

// --- SCHEDULE ---
router.get('/schedule', (req, res) => {
  const userId = getUserId(req);
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const scheduleRes = generateSchedule(dateStr, userId);
  res.json(scheduleRes);
});

router.post('/schedule/generate', (req, res) => {
  const userId = getUserId(req);
  const scheduleRes = generateSchedule(undefined, userId);
  res.json(scheduleRes);
});

// --- AI & VOICE ---
router.post('/ai/process-utterance', async (req, res) => {
  const { utterance, history } = req.body;
  if (!utterance) return res.status(400).json({ error: 'Utterance required' });

  const aiResult = await processUserUtterance(utterance, history);
  res.json(aiResult);
});

router.post('/ai/decompose-task', async (req, res) => {
  const { title } = req.body;
  const subtasks = await decomposeTaskWithAI(title || 'Final Project');
  res.json({ subtasks });
});

// --- INSIGHTS ---
router.get('/insights', (req, res) => {
  const insights = generateProductivityInsights();
  res.json(insights);
});

router.get('/insights/end-of-day', (req, res) => {
  const review = generateEndOfDayReview();
  res.json(review);
});

// --- FOCUS MODE ---
router.post('/focus/start', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const { task_id } = req.body;
  const newSession: FocusSession = {
    id: `fs_${Date.now()}`,
    user_id: userId,
    task_id: task_id || 't_1',
    start_time: new Date().toISOString(),
    actual_duration_mins: 0
  };
  data.focus_sessions.push(newSession);

  const task = data.tasks.find((t) => t.id === task_id && t.user_id === userId);
  if (task) task.status = 'in_progress';

  db.save(data);
  res.json({ session: newSession });
});

router.post('/focus/end', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const { session_id, actual_duration_mins, difficulty_rating, took_longer_than_expected, notes } = req.body;

  const session = data.focus_sessions.find((s) => s.id === session_id && s.user_id === userId) || data.focus_sessions[data.focus_sessions.length - 1];

  if (session) {
    session.end_time = new Date().toISOString();
    session.actual_duration_mins = actual_duration_mins || 25;
    session.difficulty_rating = difficulty_rating;
    session.took_longer_than_expected = took_longer_than_expected;
    session.notes = notes;

    const task = data.tasks.find((t) => t.id === session.task_id && t.user_id === userId);
    if (task) {
      task.actual_duration += session.actual_duration_mins;
      task.remaining_duration = Math.max(0, task.remaining_duration - session.actual_duration_mins);
      if (task.remaining_duration === 0) {
        task.status = 'completed';
        task.progress_percentage = 100;
      }
    }
  }

  db.save(data);
  const updatedSchedule = generateSchedule(undefined, userId);
  res.json({ session, schedule: updatedSchedule });
});

// --- NOTIFICATIONS ---
router.get('/notifications', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const userNotifs = data.notifications.filter((n) => n.user_id === userId);
  res.json(userNotifs);
});

router.post('/notifications/:id/read', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const notif = data.notifications.find((n) => n.id === req.params.id && n.user_id === userId);
  if (notif) notif.is_read = true;
  db.save(data);
  res.json({ success: true });
});

router.post('/notifications/clear', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  data.notifications = data.notifications.filter((n) => n.user_id !== userId);
  db.save(data);
  res.json({ success: true });
});

// --- DEMO MODE ENDPOINTS ---
router.post('/demo/reset', (req, res) => {
  const userId = getUserId(req);
  const freshData = db.resetDemoData();
  const scheduleRes = generateSchedule(undefined, userId);
  res.json({ message: 'Demo data reset successfully', data: freshData, schedule: scheduleRes });
});

router.post('/demo/simulate-missed-task', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const firstTask = data.tasks.find((t) => t.user_id === userId) || data.tasks[0];
  const scheduleRes = handleRecoveryMode(firstTask ? firstTask.id : 't_1', 'Too difficult', 'Simulated missed task for hackathon presentation.', userId);
  res.json({ message: 'Simulated missed task triggered Recovery Mode', ...scheduleRes });
});

router.post('/demo/simulate-early-completion', (req, res) => {
  const userId = getUserId(req);
  const data = db.get();
  const task = data.tasks.find((t) => t.user_id === userId && t.status !== 'completed') || data.tasks[0];
  if (task) {
    task.status = 'completed';
    task.progress_percentage = 100;
    task.actual_duration = 95;
    task.remaining_duration = 0;
    task.completed_at = new Date().toISOString();
  }
  db.save(data);
  const scheduleRes = generateSchedule(undefined, userId);
  res.json({ message: 'Simulated early completion', schedule: scheduleRes });
});
