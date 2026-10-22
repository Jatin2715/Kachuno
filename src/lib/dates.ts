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
