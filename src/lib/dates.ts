/**
 * Kachuno Date Helpers (Step 2.8 & Architecture Specs)
 * CRITICAL RULE: Treat `due_date` as a date-only string ('YYYY-MM-DD').
 * Never parse it with `new Date('YYYY-MM-DD')` directly as UTC, which causes
 * off-by-one errors across timezones.
 */

/**
 * Returns today's date in local 'YYYY-MM-DD' format.
 */
export function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given 'YYYY-MM-DD' string is strictly before local today.
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = getLocalToday();
  return dueDate < today;
}

/**
 * Checks if a given 'YYYY-MM-DD' string matches local today.
 */
export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate === getLocalToday();
}

/**
 * Checks if a given 'YYYY-MM-DD' falls within the current week (Monday to Sunday).
 */
export function isDueThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  
  // Calculate Monday of this week
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  
  const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
  
  return dueDate >= mondayStr && dueDate <= sundayStr;
}

/**
 * Checks if an ISO timestamp string represents today in local time.
 */
export function isCompletedToday(completedAt: string | null): boolean {
  if (!completedAt) return false;
  try {
    const d = new Date(completedAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` === getLocalToday();
  } catch {
    return false;
  }
}

/**
 * Formats a 'YYYY-MM-DD' string into a friendly localized date
 * without timezone drift (e.g., "Oct 24, 2026" or "Today", "Tomorrow", "Yesterday").
 */
export function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  
  const today = getLocalToday();
  if (dateStr === today) return 'Today';
  
  // Parse year, month, day as integers
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  
  // Check yesterday & tomorrow relative to today
  const nowDate = new Date();
  const testDate = new Date(year, month, day);
  
  const yesterday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1);
  if (
    testDate.getFullYear() === yesterday.getFullYear() &&
    testDate.getMonth() === yesterday.getMonth() &&
    testDate.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  const tomorrow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1);
  if (
    testDate.getFullYear() === tomorrow.getFullYear() &&
    testDate.getMonth() === tomorrow.getMonth() &&
    testDate.getDate() === tomorrow.getDate()
  ) {
    return 'Tomorrow';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: year !== nowDate.getFullYear() ? 'numeric' : undefined,
  });

  return formatter.format(testDate);
}

/**
 * Checks if two 'YYYY-MM-DD' date strings represent the same calendar day.
 */
export function isSameDay(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a === b;
}

/**
 * Returns the Monday of the week for a given 'YYYY-MM-DD' date string.
 * Week-start convention: Monday (ISO 8601 standard).
 */
export function getStartOfWeek(dateStr: string): string {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(year, month, day - dayOfWeek);

  const mYear = monday.getFullYear();
  const mMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const mDay = String(monday.getDate()).padStart(2, '0');
  return `${mYear}-${mMonth}-${mDay}`;
}

/**
 * Returns an array of 7 'YYYY-MM-DD' strings for the week,
 * starting from the given start date (expected to be a Monday).
 */
export function getWeekDays(startDateStr: string): string[] {
  const mondayStr = getStartOfWeek(startDateStr);
  const parts = mondayStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const startDay = parseInt(parts[2], 10);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(year, month, startDay + i);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
  }
  return days;
}

/**
 * Returns month boundaries { start, end } for a given year and 1-indexed month (1-12).
 * e.g., 2026, 10 -> { start: '2026-10-01', end: '2026-10-31' }
 */
export function getMonthBoundaries(year: number, month: number): { start: string; end: string } {
  const startMonthStr = String(month).padStart(2, '0');
  const startDateStr = `${year}-${startMonthStr}-01`;

  // Last day of month: new Date(year, month, 0) gives last day of (month)
  const lastDate = new Date(year, month, 0).getDate();
  const endDateStr = `${year}-${startMonthStr}-${String(lastDate).padStart(2, '0')}`;

  return { start: startDateStr, end: endDateStr };
}

/**
 * Returns all Date objects belonging to a month (year, 1-indexed month 1-12).
 */
export function getMonthDays(year: number, month: number): Date[] {
  const totalDays = new Date(year, month, 0).getDate();
  const dates: Date[] = [];
  for (let d = 1; d <= totalDays; d++) {
    dates.push(new Date(year, month - 1, d));
  }
  return dates;
}

export interface CalendarGridCell {
  dateStr: string;          // 'YYYY-MM-DD'
  dayNumber: number;        // 1-31
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates calendar grid cells for a month view with Monday as week start.
 * Padded with days from previous/next months to form a complete 7-column grid (35 or 42 cells).
 */
export function getMonthGridCells(year: number, month: number): CalendarGridCell[] {
  const todayStr = getLocalToday();
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Day of week for 1st of month: Monday = 0, Sunday = 6
  const leadingPadCount = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month's last days for leading padding
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
  const prevMonthYear = month === 1 ? year - 1 : year;
  const prevMonthNum = month === 1 ? 12 : month - 1;

  const cells: CalendarGridCell[] = [];

  // 1. Leading padding cells
  for (let i = leadingPadCount - 1; i >= 0; i--) {
    const day = prevMonthLastDate - i;
    const dateStr = `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // 2. Current month days
  const currentMonthStr = String(month).padStart(2, '0');
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = `${year}-${currentMonthStr}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // 3. Trailing padding cells to fill the last row (up to multiple of 7)
  const remainingInRow = (7 - (cells.length % 7)) % 7;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;

  for (let day = 1; day <= remainingInRow; day++) {
    const dateStr = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

/**
 * Returns formatted month and year (e.g. "October 2026").
 */
export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
}

/**
 * Steps a month forward or backward.
 */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  let targetMonth = month + delta;
  let targetYear = year;

  while (targetMonth > 12) {
    targetMonth -= 12;
    targetYear += 1;
  }
  while (targetMonth < 1) {
    targetMonth += 12;
    targetYear -= 1;
  }

  return { year: targetYear, month: targetMonth };
}

/**
 * Shifts a 'YYYY-MM-DD' date by +/- N days.
 */
export function shiftDate(dateStr: string, daysDelta: number): string {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day + daysDelta);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

