// CodeAJ Todo & Calendar - Date & Recurrence Utilities

export const DAYS_OF_WEEK = [
  { id: 0, name: 'Sun', short: 'S', full: 'Sunday' },
  { id: 1, name: 'Mon', short: 'M', full: 'Monday' },
  { id: 2, name: 'Tue', short: 'T', full: 'Tuesday' },
  { id: 3, name: 'Wed', short: 'W', full: 'Wednesday' },
  { id: 4, name: 'Thu', short: 'T', full: 'Thursday' },
  { id: 5, name: 'Fri', short: 'F', full: 'Friday' },
  { id: 6, name: 'Sat', short: 'S', full: 'Saturday' },
];

export const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  { id: 'personal', name: 'Personal', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  { id: 'health', name: 'Health & Fitness', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  { id: 'study', name: 'Study & Learning', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'urgent', name: 'Priority / Urgent', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
];

/**
 * Returns 'YYYY-MM-DD' from a Date object
 */
export function toDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' into local Date object (avoiding timezone offset issues)
 */
export function parseDateString(str) {
  if (!str) return new Date();
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today as 'YYYY-MM-DD'
 */
export function getTodayString() {
  return toDateString(new Date());
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr) {
  return dateStr === getTodayString();
}

/**
 * Format date for display: "Thu, Oct 1" or "Thursday, October 1, 2026"
 */
export function formatFriendlyDate(dateStr, format = 'medium') {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  const now = new Date();
  const todayStr = getTodayString();

  if (dateStr === todayStr) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dateStr === toDateString(yesterday)) {
    return 'Yesterday';
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (dateStr === toDateString(tomorrow)) {
    return 'Tomorrow';
  }

  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (format === 'full') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate full month grid for calendar (including padding days)
 */
export function getMonthGrid(year, month) {
  // month: 0-indexed (0=Jan, 11=Dec)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month padding days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, dayNum);
    days.push({
      dateStr: toDateString(prevDate),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      date: prevDate,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currDate = new Date(year, month, d);
    days.push({
      dateStr: toDateString(currDate),
      dayNumber: d,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      date: currDate,
    });
  }

  // Next month padding days to complete grid (42 cells = 6 rows x 7 cols)
  const remainingCells = 42 - days.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextDate = new Date(year, month + 1, n);
    days.push({
      dateStr: toDateString(nextDate),
      dayNumber: n,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      date: nextDate,
    });
  }

  return days;
}

/**
 * Get 7 days for a given week containing the baseDate
 */
export function getWeekDays(baseDate = new Date()) {
  const d = new Date(baseDate);
  const dayOfWeek = d.getDay(); // 0=Sunday
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - dayOfWeek); // start on Sunday

  const week = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    week.push({
      dateStr: toDateString(current),
      dayName: DAYS_OF_WEEK[i].name,
      dayShort: DAYS_OF_WEEK[i].short,
      dayFullName: DAYS_OF_WEEK[i].full,
      dayNumber: current.getDate(),
      date: current,
      isToday: toDateString(current) === getTodayString(),
    });
  }
  return week;
}

/**
 * Determine if a recurring daily routine is scheduled on a given dateStr
 */
export function isRoutineActiveOnDate(routine, dateStr) {
  if (!routine || !dateStr) return false;

  // Start date boundary
  if (routine.startDate && dateStr < routine.startDate) {
    return false;
  }

  // Optional end date boundary
  if (routine.endDate && dateStr > routine.endDate) {
    return false;
  }

  const d = parseDateString(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

  // If this weekday is in excludedDays (e.g. [0, 6] for weekend skip)
  if (routine.excludedDays && routine.excludedDays.includes(dayOfWeek)) {
    return false;
  }

  // If this specific date is an exception manually skipped by user
  if (routine.customExceptionDates && routine.customExceptionDates.includes(dateStr)) {
    return false;
  }

  return true;
}

/**
 * Calculate current continuous streak for a daily routine
 */
export function calculateRoutineStreak(routine) {
  if (!routine) return 0;
  const todayStr = getTodayString();
  const completedHistory = routine.completedHistory || {};

  let streak = 0;
  const cursor = new Date();

  // If today is active and already completed, count today and check backwards
  // If today is active and not yet completed, check from yesterday backwards without breaking
  const todayActive = isRoutineActiveOnDate(routine, todayStr);
  const todayDone = completedHistory[todayStr];

  if (todayActive && todayDone) {
    streak += 1;
  }

  // Walk backwards up to 365 days
  for (let i = 1; i <= 365; i++) {
    const pastDate = new Date();
    pastDate.setDate(cursor.getDate() - i);
    const pastDateStr = toDateString(pastDate);

    if (routine.startDate && pastDateStr < routine.startDate) {
      break;
    }

    if (isRoutineActiveOnDate(routine, pastDateStr)) {
      if (completedHistory[pastDateStr]) {
        streak += 1;
      } else {
        // missed an active day - streak ends
        break;
      }
    }
  }

  return streak;
}

/**
 * Calculate completion rate for routine over past N active days
 */
export function calculateRoutineStats(routine, daysBack = 14) {
  if (!routine) return { totalActive: 0, completed: 0, percentage: 0 };
  const completedHistory = routine.completedHistory || {};
  let totalActive = 0;
  let completed = 0;

  for (let i = 0; i < daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateString(d);

    if (routine.startDate && dateStr < routine.startDate) continue;

    if (isRoutineActiveOnDate(routine, dateStr)) {
      totalActive++;
      if (completedHistory[dateStr]) {
        completed++;
      }
    }
  }

  const percentage = totalActive > 0 ? Math.round((completed / totalActive) * 100) : 0;
  return { totalActive, completed, percentage };
}
