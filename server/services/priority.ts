import { Task } from '../db';
import { differenceInHours, parseISO } from 'date-fns';

export interface PriorityResult {
  score: number;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export const calculateTaskPriority = (
  task: Partial<Task>,
  availableHoursBeforeDeadline: number = 4
): PriorityResult => {
  const now = new Date();
  const deadlineDate = task.deadline ? parseISO(task.deadline) : new Date(Date.now() + 48 * 3600 * 1000);
  const hoursRemaining = Math.max(0, differenceInHours(deadlineDate, now));
  const remainingMins = task.remaining_duration ?? task.estimated_duration ?? 60;
  const remainingHours = remainingMins / 60;

  let score = 0;
  const explanationParts: string[] = [];

  // Check Overdue
  if (deadlineDate.getTime() < now.getTime() && task.status !== 'completed') {
    return {
      score: 98,
      level: 'CRITICAL',
      explanation: `Overdue! Deadline passed and ${Math.round(remainingMins)} mins of work remain.`
    };
  }

  // 1. Urgency Component (Max 40 points)
  let urgencyScore = 0;
  if (hoursRemaining <= 12) {
    urgencyScore = 40;
    explanationParts.push(`Deadline is very urgent (${hoursRemaining}h remaining)`);
  } else if (hoursRemaining <= 24) {
    urgencyScore = 32;
    explanationParts.push(`Deadline is tomorrow (${hoursRemaining}h remaining)`);
  } else if (hoursRemaining <= 48) {
    urgencyScore = 22;
    explanationParts.push(`Deadline in 2 days (${hoursRemaining}h remaining)`);
  } else {
    urgencyScore = Math.max(5, 20 - Math.floor((hoursRemaining - 48) / 12));
    explanationParts.push(`Deadline in ${Math.round(hoursRemaining / 24)} days`);
  }
  score += urgencyScore;

  // 2. Effort vs Available Time Ratio (Max 25 points)
  let ratioScore = 0;
  if (availableHoursBeforeDeadline > 0) {
    const ratio = remainingHours / availableHoursBeforeDeadline;
    if (ratio >= 0.8) {
      ratioScore = 25;
      explanationParts.push(`High effort ratio: ${remainingMins} mins work needed in ${availableHoursBeforeDeadline.toFixed(1)} available hours`);
    } else if (ratio >= 0.5) {
      ratioScore = 18;
      explanationParts.push(`${remainingMins} mins work requires significant portion of your free window`);
    } else {
      ratioScore = 10;
      explanationParts.push(`Comfortable free time window before deadline`);
    }
  } else {
    ratioScore = 20;
  }
  score += ratioScore;

  // 3. Importance Weight (Max 25 points)
  let importanceScore = 10;
  switch (task.importance) {
    case 'CRITICAL':
      importanceScore = 25;
      break;
    case 'HIGH':
      importanceScore = 20;
      break;
    case 'MEDIUM':
      importanceScore = 12;
      break;
    case 'LOW':
      importanceScore = 5;
      break;
  }
  score += importanceScore;

  // 4. Difficulty Bonus (Max 10 points)
  let difficultyScore = 5;
  switch (task.difficulty) {
    case 'Very Difficult':
      difficultyScore = 10;
      break;
    case 'Difficult':
      difficultyScore = 8;
      break;
    case 'Moderate':
      difficultyScore = 5;
      break;
    case 'Easy':
      difficultyScore = 2;
      break;
  }
  score += difficultyScore;

  // Cap score 1 - 99
  const finalScore = Math.min(99, Math.max(10, Math.round(score)));

  let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (finalScore >= 85) level = 'CRITICAL';
  else if (finalScore >= 70) level = 'HIGH';
  else if (finalScore >= 50) level = 'MEDIUM';
  else level = 'LOW';

  const explanation = `${explanationParts.join('; ')}. Priority score: ${finalScore}/100.`;

  return {
    score: finalScore,
    level,
    explanation,
  };
};
