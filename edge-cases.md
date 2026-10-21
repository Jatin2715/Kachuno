# Kachuno — Edge Cases & Corner Scenarios

> **Version 1.0 · 21 October 2026**
> Derived from [architecture.md](file:///c:/Users/jatin/OneDrive/Documents/CODING-LIFE/Kachuno/architecture.md) and [implementation-plan.md](file:///c:/Users/jatin/OneDrive/Documents/CODING-LIFE/Kachuno/implementation-plan.md)

---

## How to Use This Document

Each edge case is tagged with:

| Tag | Meaning |
|---|---|
| 🔴 **Critical** | Data loss, security breach, or crash. Must fix before release. |
| 🟡 **Important** | Incorrect behavior or misleading UI. Should fix before release. |
| 🟢 **Minor** | Cosmetic or low-impact. Can document as known issue if needed. |

Test each case and record the result. A blank status means untested.

---

## Table of Contents

1. [Task Management](#1-task-management)
2. [Date & Timezone](#2-date--timezone)
3. [Calendar Views](#3-calendar-views)
4. [Focus Timer](#4-focus-timer)
5. [Progress & Metrics](#5-progress--metrics)
6. [Authentication & Sessions](#6-authentication--sessions)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Database & Data Integrity](#8-database--data-integrity)
9. [Network & Offline](#9-network--offline)
10. [Responsive & Accessibility](#10-responsive--accessibility)
11. [Deployment & Environment](#11-deployment--environment)
12. [Capacitor / Android](#12-capacitor--android)
13. [Concurrency & Race Conditions](#13-concurrency--race-conditions)

---

## 1. Task Management

### 1.1 Title Validation

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| T-01 | Empty string title | Rejected with validation error | 🔴 | ☐ |
| T-02 | Whitespace-only title (`"   "`) | Rejected after trimming — treated as empty | 🔴 | ☐ |
| T-03 | Title with leading/trailing spaces (`"  Buy milk  "`) | Accepted but trimmed to `"Buy milk"` | 🟡 | ☐ |
| T-04 | Title at exactly 160 characters | Accepted | 🟢 | ☐ |
| T-05 | Title at 161 characters | Rejected with clear max-length error | 🟡 | ☐ |
| T-06 | Title with only special characters (`"!@#$%"`) | Accepted — it's non-empty after trim | 🟢 | ☐ |
| T-07 | Title with emoji (`"📚 Study math"`) | Accepted; check character count (emoji may be multi-byte) | 🟡 | ☐ |
| T-08 | Title with newlines or tabs | Sanitize to single-line or reject | 🟢 | ☐ |
| T-09 | Title with HTML/script tags (`"<script>alert(1)</script>"`) | Rendered as plain text, never executed | 🔴 | ☐ |
| T-10 | Very long single-word title (no spaces, 160 chars) | UI wraps or truncates gracefully — no horizontal overflow | 🟡 | ☐ |

### 1.2 Description Edge Cases

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| T-11 | `null` description (not provided) | Saved as null, displayed as empty/absent | 🟢 | ☐ |
| T-12 | Empty string description (`""`) | Treated as null or empty — no phantom display | 🟢 | ☐ |
| T-13 | Description at max length (2000 chars) | Accepted | 🟢 | ☐ |
| T-14 | Description exceeding max length | Rejected with clear error | 🟡 | ☐ |
| T-15 | Description with line breaks | Preserved and rendered (not collapsed into one line) | 🟢 | ☐ |

### 1.3 State Transitions

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| T-16 | Complete an already-completed task | No-op or idempotent; `completed_at` not updated to new timestamp | 🟡 | ☐ |
| T-17 | Reopen an already-incomplete task | No-op; no error | 🟡 | ☐ |
| T-18 | Rapid toggle complete/incomplete (clicking fast) | Final state is consistent; no orphaned `completed_at` values | 🔴 | ☐ |
| T-19 | Edit a task while it's marked completed | Edit succeeds; completion state preserved unless explicitly changed | 🟡 | ☐ |
| T-20 | Delete a task that has linked focus sessions | Task deleted; focus sessions retain history with `task_id = null` | 🔴 | ☐ |
| T-21 | Delete the only task in the list | List shows empty state, not a broken layout | 🟡 | ☐ |
| T-22 | Delete all tasks | All views show appropriate empty states | 🟡 | ☐ |
| T-23 | Cancel delete confirmation | Task survives; no state change | 🟡 | ☐ |

### 1.4 Filter Edge Cases

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| T-24 | All filters active simultaneously | AND semantics — may return 0 results; show empty state | 🟡 | ☐ |
| T-25 | Filter returns 0 results | "No tasks match filters" message, not blank | 🟡 | ☐ |
| T-26 | Clear filters after filtering | Full task list returns | 🟡 | ☐ |
| T-27 | Filter by "Overdue" with 0 overdue tasks | Empty result with clear message | 🟢 | ☐ |
| T-28 | Filter by "Due today" at 11:59 PM | Uses local date; tasks due today still appear | 🟡 | ☐ |
| T-29 | Change filters while task list is still loading | No race condition; final filter state applied | 🟡 | ☐ |
| T-30 | Filter persists across navigation | Decide: filters reset on page leave or persist? Document choice | 🟢 | ☐ |

### 1.5 Bulk & Boundary Cases

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| T-31 | User has 0 tasks | All views show empty states correctly | 🟡 | ☐ |
| T-32 | User has 1,000+ tasks | List renders without hanging; consider pagination or virtual scroll | 🟡 | ☐ |
| T-33 | Two tasks with identical titles | Both saved with unique IDs; both visible | 🟢 | ☐ |
| T-34 | Task created at midnight boundary | `created_at` timezone is correct; task appears in right period | 🟡 | ☐ |

---

## 2. Date & Timezone

> [!CAUTION]
> Date bugs are the most common source of off-by-one errors. `due_date` is a calendar date (`YYYY-MM-DD`), NOT a UTC timestamp.

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| D-01 | `due_date = "2026-01-15"` displayed in UTC-5 timezone | Shows January 15, not January 14 | 🔴 | ☐ |
| D-02 | `due_date = "2026-01-15"` displayed in UTC+13 timezone | Shows January 15, not January 16 | 🔴 | ☐ |
| D-03 | `new Date("2026-01-15")` parsed as UTC midnight → local date shift | Must parse as local date, NOT `new Date()` constructor | 🔴 | ☐ |
| D-04 | User in UTC+5:30 (India) checks "due today" at 11:30 PM | Correct local date used, not UTC | 🔴 | ☐ |
| D-05 | User in UTC-12 (Baker Island) vs UTC+14 (Kiribati) | "Today" differs by up to 26 hours; local date is always source of truth | 🟡 | ☐ |
| D-06 | Task due on Feb 29 in a leap year (2028) | Valid date; accepted and displayed | 🟡 | ☐ |
| D-07 | Task due on Feb 29 in a non-leap year | Date picker should prevent this; if entered, reject | 🟡 | ☐ |
| D-08 | DST spring-forward: clocks skip 2:00 AM → 3:00 AM | `due_date` (date-only) is unaffected; `completed_at` timestamps remain accurate | 🟡 | ☐ |
| D-09 | DST fall-back: clocks repeat 1:00 AM–2:00 AM | `completed_at` uses timestamptz — unambiguous; focus `duration_seconds` uses elapsed math, not clock | 🟡 | ☐ |
| D-10 | Task with `due_date = null` | Not shown on calendar; not counted as overdue or due today; visible in Tasks list | 🟡 | ☐ |
| D-11 | Task due on the current date at midnight boundary | Consistent: `due_date === getLocalToday()` comparison works regardless of time | 🔴 | ☐ |
| D-12 | User changes device timezone mid-session | "Today" recalculates on next comparison; overdue/due-today may shift | 🟢 | ☐ |
| D-13 | `due_date` set to a date far in the past (e.g., 2020-01-01) | Accepted; displayed as overdue | 🟢 | ☐ |
| D-14 | `due_date` set to a date far in the future (e.g., 2099-12-31) | Accepted; not overdue, not due today | 🟢 | ☐ |

---

## 3. Calendar Views

### 3.1 Month View

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| C-01 | February in leap year (2028) — 29 days | 29 cells rendered | 🟡 | ☐ |
| C-02 | February in non-leap year — 28 days | 28 cells rendered | 🟡 | ☐ |
| C-03 | Month with 30 days (April, June, Sept, Nov) | Correct day count | 🟡 | ☐ |
| C-04 | Month with 31 days (Jan, Mar, May, Jul, Aug, Oct, Dec) | Correct day count | 🟡 | ☐ |
| C-05 | Month starting on Sunday (if week starts Monday) | Empty cells at start; grid aligns correctly | 🟡 | ☐ |
| C-06 | Month starting on Monday (if week starts Monday) | No empty leading cells | 🟢 | ☐ |
| C-07 | Month starting on Saturday (if week starts Monday) | 5–6 leading empty cells | 🟡 | ☐ |
| C-08 | Navigate Dec 2026 → Jan 2027 (year boundary) | Year increments; month resets to January | 🔴 | ☐ |
| C-09 | Navigate Jan 2027 → Dec 2026 (backwards year boundary) | Year decrements; month sets to December | 🔴 | ☐ |
| C-10 | Navigate rapidly (click next 20 times fast) | No race condition; lands on correct month | 🟡 | ☐ |
| C-11 | Day with 0 tasks | No indicator dot; clickable but shows empty task list | 🟢 | ☐ |
| C-12 | Day with 20+ tasks | Indicator shows; task list scrollable, not overflowing | 🟡 | ☐ |
| C-13 | Select a date, then navigate to a different month | Selected date clears or persists — document behavior | 🟢 | ☐ |
| C-14 | Calendar on very narrow screen (320px) | Days still tappable (≥44px targets); no horizontal overflow | 🟡 | ☐ |

### 3.2 Week View

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| C-15 | Week spanning two months (e.g., Oct 27 – Nov 2) | Both months' dates displayed correctly | 🟡 | ☐ |
| C-16 | Week spanning two years (Dec 29 – Jan 4) | Year boundary handled; dates are correct | 🔴 | ☐ |
| C-17 | Week containing Feb 29 in a leap year | Leap day appears as expected | 🟡 | ☐ |
| C-18 | First week of the year (partial week) | Depends on week-start convention; document behavior | 🟢 | ☐ |

---

## 4. Focus Timer

### 4.1 Timer Accuracy

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| F-01 | Start timer, switch to another browser tab for 5 minutes, return | Displayed elapsed time = ~5 min (timestamp-based, not tick-based) | 🔴 | ☐ |
| F-02 | Start timer, minimize browser for 10 minutes | Same as F-01; elapsed calculated from timestamps | 🔴 | ☐ |
| F-03 | Start timer, lock device screen, unlock after 15 minutes | Elapsed time is accurate (may need `visibilitychange` event to refresh) | 🔴 | ☐ |
| F-04 | Start timer, device goes to sleep, wake up | Elapsed should be accurate if `Date.now()` works on wake; test on target devices | 🟡 | ☐ |
| F-05 | `setInterval` is throttled by browser (background tab policy) | Timer display may update slowly but elapsed value is still correct (timestamp math) | 🟡 | ☐ |
| F-06 | System clock is adjusted backwards during a running timer | `Date.now()` could yield negative elapsed. Guard: `Math.max(0, elapsed)` | 🟡 | ☐ |
| F-07 | System clock is adjusted forwards during a running timer | Elapsed jumps; this is technically correct but may surprise user | 🟢 | ☐ |

### 4.2 State Transitions

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| F-08 | Pause immediately after start (< 1 second elapsed) | Paused at 0 or 1 second; valid state | 🟢 | ☐ |
| F-09 | Pause and resume 50 times in a row | Total paused time accumulated correctly; no drift | 🟡 | ☐ |
| F-10 | Complete with exactly 1 second elapsed | Minimum threshold met; session saved | 🟡 | ☐ |
| F-11 | Complete with 0 seconds elapsed | Rejected — minimum 1 second required | 🔴 | ☐ |
| F-12 | Reset with 0 seconds elapsed | Reset immediately; no confirmation needed | 🟢 | ☐ |
| F-13 | Reset with significant elapsed time (e.g., 25 minutes) | Confirmation dialog: "Discard 25 minutes of focus time?" | 🟡 | ☐ |
| F-14 | Cancel reset confirmation | Timer continues from where it was | 🟡 | ☐ |
| F-15 | Complete while already in `saving` state | Button disabled; no duplicate API call | 🔴 | ☐ |
| F-16 | Complete, save fails, retry, save succeeds | Only one session record created | 🔴 | ☐ |
| F-17 | Complete, save fails, retry, save fails again | Error persists; user can discard or retry | 🟡 | ☐ |

### 4.3 Task Linking

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| F-18 | Link a task, then delete that task before completing the session | Session saves with `task_id = null` (task no longer exists) or save captures current state | 🟡 | ☐ |
| F-19 | Link a task, complete the task during the focus session | Session still saves with `task_id`; task completion is independent | 🟢 | ☐ |
| F-20 | Change linked task mid-session | Use the task selected at save time, or lock at start — document choice | 🟢 | ☐ |
| F-21 | No task linked | `task_id = null`; session saves successfully | 🟡 | ☐ |
| F-22 | Link a task that belongs to another user (RLS) | Impossible via UI; if attempted via direct query, FK check + RLS rejects | 🔴 | ☐ |

### 4.4 Page Navigation & Reload

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| F-23 | Navigate away from Focus page with timer running | Decide: warn user? Timer state lost? Document behavior. | 🟡 | ☐ |
| F-24 | Refresh the page with timer running | Timer state lost (unless persisted in localStorage). Document behavior. | 🟡 | ☐ |
| F-25 | Close browser tab with timer running | Unsaved session is lost. Consider `beforeunload` warning. | 🟡 | ☐ |
| F-26 | Open Focus page in two browser tabs | Each tab has independent timer state. Saving from both could create two sessions. | 🟡 | ☐ |

### 4.5 Duration Display

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| F-27 | Session of exactly 60 seconds | Display: `01:00` or `1 min` — not `60 seconds` in history | 🟢 | ☐ |
| F-28 | Session of 3599 seconds (59:59) | Display: `59:59` | 🟢 | ☐ |
| F-29 | Session of 3600 seconds (1 hour) | Display: `1:00:00` or `60 min` — format transition works | 🟢 | ☐ |
| F-30 | Session exceeding 24 hours (unlikely but possible) | Display handles gracefully; no overflow | 🟢 | ☐ |

---

## 5. Progress & Metrics

### 5.1 Completion Rate

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| P-01 | 0 tasks created in period (denominator = 0) | Display "No tasks in this period" — NOT 0%, NOT 100%, NOT NaN | 🔴 | ☐ |
| P-02 | 1 task created, 0 completed (0/1) | Display 0% | 🟡 | ☐ |
| P-03 | 1 task created, 1 completed (1/1) | Display 100% | 🟡 | ☐ |
| P-04 | 5 created, 3 completed (3/5) | Display 60% | 🟢 | ☐ |
| P-05 | Task created in period, completed outside period | Counted in denominator (created); not in numerator (completed outside) | 🟡 | ☐ |
| P-06 | Task created outside period, completed inside period | NOT counted in either (created_at determines period membership) | 🔴 | ☐ |
| P-07 | Task created and completed on period boundary date | Inclusion rule is consistent (inclusive start, exclusive end? or both inclusive?) | 🔴 | ☐ |
| P-08 | Completion rate with many decimal places (e.g., 1/3) | Display "33%" — round, don't show "33.333333%" | 🟢 | ☐ |

### 5.2 Overdue Count

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| P-09 | Task due yesterday, incomplete | Counted as overdue | 🟡 | ☐ |
| P-10 | Task due yesterday, completed | NOT counted as overdue | 🔴 | ☐ |
| P-11 | Task due today, incomplete | NOT overdue (due today ≠ overdue) | 🔴 | ☐ |
| P-12 | Task due today, completed | NOT overdue | 🟡 | ☐ |
| P-13 | Task with no due date, incomplete | NOT overdue (no date to compare) | 🟡 | ☐ |
| P-14 | Task due 1 year ago, incomplete | Counted as overdue | 🟢 | ☐ |
| P-15 | 0 overdue tasks | Display 0, not blank or hidden | 🟢 | ☐ |

### 5.3 Focus Minutes

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| P-16 | 0 focus sessions in period | Display 0 min — not empty/NaN | 🟡 | ☐ |
| P-17 | Session `ended_at` exactly on period boundary | Consistent inclusion/exclusion rule applied | 🟡 | ☐ |
| P-18 | 90-second session → display | "2 min" (rounded) or "1 min 30 sec" — document rounding rule | 🟢 | ☐ |
| P-19 | Cancelled session in period | NOT counted in focus minutes (only `status = 'completed'`) | 🔴 | ☐ |
| P-20 | Session spanning midnight (started 11:55 PM, ended 12:05 AM) | `ended_at` determines period; duration is full 10 minutes | 🟡 | ☐ |

### 5.4 Weekly Trend

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| P-21 | Day with 0 completed tasks | Displayed as 0 in the chart — NOT omitted | 🔴 | ☐ |
| P-22 | Day with 0 focus minutes | Displayed as 0 — NOT fabricated | 🔴 | ☐ |
| P-23 | All 7 days with 0 activity | All bars/points are zero; empty state message alongside chart | 🟡 | ☐ |
| P-24 | Week containing a DST transition | Day still has 24 hours of local-date activity (date-based, not hour-based) | 🟡 | ☐ |
| P-25 | "This week" vs "Last 7 days" — which definition? | ONE consistent definition everywhere; label matches calculation | 🔴 | ☐ |
| P-26 | First day of usage (only 1 day of data) | Show 1 data point and 6 zeros (or equivalent honest representation) | 🟡 | ☐ |

### 5.5 Period Boundaries

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| P-27 | "This month" on the 1st of the month | Range is just 1 day; calculations correct | 🟡 | ☐ |
| P-28 | "This week" on Monday (week start) | Range is just 1 day | 🟡 | ☐ |
| P-29 | Change period selector while data is loading | Cancel previous query or apply final selection | 🟡 | ☐ |
| P-30 | Switching between periods rapidly | No stale data displayed from previous period | 🟡 | ☐ |

---

## 6. Authentication & Sessions

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| A-01 | Sign up with invalid email format | Rejected with "Invalid email" | 🟡 | ☐ |
| A-02 | Sign up with already-registered email | Error: "Email already registered" (or Supabase equivalent) | 🟡 | ☐ |
| A-03 | Sign up with weak password | Supabase enforces minimum length; display clear error | 🟡 | ☐ |
| A-04 | Sign in with correct email, wrong password | "Invalid credentials" — don't reveal which field is wrong | 🔴 | ☐ |
| A-05 | Sign in with non-existent email | Same generic error as A-04 | 🔴 | ☐ |
| A-06 | Session expires while user is on the app | Detect via `onAuthStateChange`; redirect to sign-in, not blank screen | 🔴 | ☐ |
| A-07 | Refresh the page after sign-in | Session restored from Supabase; user stays signed in | 🔴 | ☐ |
| A-08 | Sign out, press browser back button | Should show sign-in page, NOT cached authenticated content | 🟡 | ☐ |
| A-09 | Open app in two tabs, sign out in one | Other tab should detect session loss on next interaction | 🟡 | ☐ |
| A-10 | Access a protected route directly via URL without session | Redirect to sign-in; after sign-in, redirect back to intended page | 🟡 | ☐ |
| A-11 | Sign-in form submitted with empty fields | Client-side validation prevents submission | 🟡 | ☐ |
| A-12 | Paste email with leading/trailing spaces | Trim before sending to Supabase | 🟢 | ☐ |
| A-13 | Email with mixed case (`User@Email.COM`) | Supabase treats email as case-insensitive; should work | 🟢 | ☐ |
| A-14 | Network error during sign-in | Show "Network error. Please try again." — not a crash | 🟡 | ☐ |
| A-15 | Double-click sign-in button | Prevent duplicate requests; disable button while loading | 🟡 | ☐ |
| A-16 | Password reset (if not implemented in V1) | Show informative message: "Password reset is not yet available" | 🟡 | ☐ |

---

## 7. Row Level Security (RLS)

> [!CAUTION]
> Every test in this section is **critical**. RLS is the security boundary. UI filtering alone is NOT security.

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| R-01 | User B queries `SELECT * FROM tasks` | Returns only B's tasks; A's are invisible | 🔴 | ☐ |
| R-02 | User B queries `SELECT * FROM tasks WHERE id = '<A's task ID>'` | Returns empty (not a 403, just no rows) | 🔴 | ☐ |
| R-03 | User B inserts a task with `user_id = A's UUID` | Rejected by `WITH CHECK` policy | 🔴 | ☐ |
| R-04 | User B updates A's task: `UPDATE tasks SET title = 'hacked' WHERE id = '<A's ID>'` | No rows affected; A's task unchanged | 🔴 | ☐ |
| R-05 | User B deletes A's task: `DELETE FROM tasks WHERE id = '<A's ID>'` | No rows affected; A's task survives | 🔴 | ☐ |
| R-06 | User B updates their own task's `user_id` to A's UUID | Rejected by `WITH CHECK` policy — ownership transfer blocked | 🔴 | ☐ |
| R-07 | Same tests (R-01 through R-06) on `focus_sessions` table | Same results — fully isolated | 🔴 | ☐ |
| R-08 | User B creates a focus session with `task_id` pointing to A's task | RLS on sessions passes (B's `user_id`), but FK points to A's task. Consider a trigger/constraint. | 🔴 | ☐ |
| R-09 | Unauthenticated request (no JWT) | All tables return empty; no data leakage | 🔴 | ☐ |
| R-10 | Expired JWT token used for queries | Supabase rejects; app detects and redirects to sign-in | 🔴 | ☐ |
| R-11 | RLS accidentally disabled on a table | All users see all data — CRITICAL to verify RLS is ON before launch | 🔴 | ☐ |
| R-12 | New table added without RLS | Exposed to all authenticated users by default — always enable RLS first | 🔴 | ☐ |

---

## 8. Database & Data Integrity

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| DB-01 | Insert task with priority = `"urgent"` (not in allowlist) | CHECK constraint rejects; UI shows error | 🔴 | ☐ |
| DB-02 | Insert task with category = `"fitness"` (not in allowlist) | CHECK constraint rejects | 🔴 | ☐ |
| DB-03 | Insert focus session with `duration_seconds = -1` | CHECK constraint rejects | 🔴 | ☐ |
| DB-04 | Insert focus session with `status = "active"` (not in allowlist) | CHECK constraint rejects | 🔴 | ☐ |
| DB-05 | Delete user account in Supabase Auth | `ON DELETE CASCADE` removes all tasks and focus sessions | 🔴 | ☐ |
| DB-06 | Delete a task that is `task_id` FK in a focus session | `ON DELETE SET NULL` — session preserved, `task_id` becomes null | 🔴 | ☐ |
| DB-07 | Insert task with `due_date = "not-a-date"` | DB rejects invalid date; UI should prevent this too | 🟡 | ☐ |
| DB-08 | Concurrent updates to the same task (two tabs) | Last write wins; no crash or data corruption | 🟡 | ☐ |
| DB-09 | `updated_at` trigger fires on UPDATE | `updated_at` reflects actual last edit time | 🟡 | ☐ |
| DB-10 | UUID collision (astronomically unlikely) | DB rejects duplicate PK; app retries with new UUID | 🟢 | ☐ |
| DB-11 | Very long text in a non-constrained field | Supabase/PostgreSQL handles; but may affect UI rendering | 🟢 | ☐ |

---

## 9. Network & Offline

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| N-01 | Network disconnects during task save | Error message: "Failed to save. Check your connection." + retry option | 🔴 | ☐ |
| N-02 | Network disconnects during focus session save | Error shown; session data retained in timer state for retry | 🔴 | ☐ |
| N-03 | Network disconnects during sign-in | "Network error" message; not a blank screen or cryptic error | 🟡 | ☐ |
| N-04 | Network disconnects during initial data load | Loading state doesn't hang forever; error after timeout | 🟡 | ☐ |
| N-05 | Network reconnects after offline period | Data refreshes on next action; stale data doesn't persist | 🟡 | ☐ |
| N-06 | Slow network (high latency, 5+ second responses) | Loading indicators visible; UI not frozen; no duplicate submissions | 🟡 | ☐ |
| N-07 | Supabase free-tier rate limiting | Graceful error handling; user informed | 🟡 | ☐ |
| N-08 | Supabase service is down | App shows clear error, not a white screen | 🟡 | ☐ |
| N-09 | Network error during task delete | Task still exists; UI reverts optimistic delete (if used) | 🟡 | ☐ |
| N-10 | Offline during page navigation | Cached routes may work; data-dependent pages show error | 🟢 | ☐ |

---

## 10. Responsive & Accessibility

### 10.1 Viewport Edge Cases

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| U-01 | 320px width (smallest common phone) | All content reachable; no horizontal scroll; text readable | 🟡 | ☐ |
| U-02 | 375px width (iPhone SE) | Standard mobile layout works | 🟡 | ☐ |
| U-03 | 768px width (iPad portrait) | Layout transition between mobile and desktop | 🟡 | ☐ |
| U-04 | 1024px width (iPad landscape / small laptop) | Desktop layout or graceful intermediate | 🟢 | ☐ |
| U-05 | 1920px+ width (large desktop) | Content doesn't stretch to edges; max-width container | 🟢 | ☐ |
| U-06 | 400% browser zoom | Content reflows; no clipping or overlap | 🟡 | ☐ |
| U-07 | Landscape orientation on phone | Timer, forms, calendar still usable | 🟢 | ☐ |
| U-08 | On-screen keyboard opens (mobile) | Active input not hidden behind keyboard; page scrolls to input | 🟡 | ☐ |
| U-09 | iOS Safari bottom bar / notch area | Content not hidden behind safe areas | 🟡 | ☐ |

### 10.2 Accessibility Edge Cases

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| U-10 | Tab through entire app with keyboard only | All interactive elements reachable in logical order | 🟡 | ☐ |
| U-11 | Focus trap in modal/dialog | Tab stays inside modal; Escape closes it | 🟡 | ☐ |
| U-12 | Icon-only button without label | Screen reader announces purpose (via `aria-label`) | 🟡 | ☐ |
| U-13 | Form error messages | Associated with input via `aria-describedby`; announced by screen reader | 🟡 | ☐ |
| U-14 | Timer state changes | Announced via `aria-live` region (polite) | 🟢 | ☐ |
| U-15 | Color-only information (e.g., red = overdue) | Also indicated by text, icon, or pattern — not color alone | 🟡 | ☐ |
| U-16 | Text contrast ratio | Meets WCAG AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large text | 🟡 | ☐ |
| U-17 | Reduced motion preference (`prefers-reduced-motion`) | Animations disabled or simplified | 🟢 | ☐ |
| U-18 | Dark mode / high contrast mode | If supported: tokens adapt. If not: document as known limitation | 🟢 | ☐ |

---

## 11. Deployment & Environment

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| E-01 | `VITE_SUPABASE_URL` missing in production | Clear error message, not a white screen or runtime crash | 🔴 | ☐ |
| E-02 | `VITE_SUPABASE_ANON_KEY` missing in production | Clear error message | 🔴 | ☐ |
| E-03 | Wrong anon key (typo or rotated) | Supabase rejects; app shows auth/connection error | 🟡 | ☐ |
| E-04 | Build succeeds locally but fails on Vercel | Different Node version, missing env var, or lockfile mismatch | 🟡 | ☐ |
| E-05 | Vercel env vars changed but not redeployed | Old values still in effect; must trigger redeploy | 🟡 | ☐ |
| E-06 | Supabase redirect URL not configured for deployed domain | Auth works on localhost but fails on production (redirect error) | 🔴 | ☐ |
| E-07 | HTTPS mismatch (deployed site vs Supabase config) | Mixed content or CORS errors | 🟡 | ☐ |
| E-08 | `.env` file accidentally committed to Git | **ROTATE ALL KEYS IMMEDIATELY**; removing the line is not enough (Git history) | 🔴 | ☐ |
| E-09 | Service-role key in frontend code or Vite env | Full database access exposed to every user — CRITICAL | 🔴 | ☐ |
| E-10 | Free-tier bandwidth/build limit exceeded | Vercel or Supabase may suspend; check limits before launch | 🟡 | ☐ |
| E-11 | Custom domain configured without SSL | Browser blocks mixed content; ensure HTTPS | 🟡 | ☐ |
| E-12 | SPA routing: direct URL to `/tasks` returns 404 on Vercel | Configure Vercel rewrites: `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }` | 🟡 | ☐ |

---

## 12. Capacitor / Android

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| M-01 | Web build output directory doesn't match `capacitor.config.ts` `webDir` | `npx cap sync` copies wrong/empty files; app shows blank | 🔴 | ☐ |
| M-02 | `npx cap sync` run before `npm run build` | Android project has stale or missing web assets | 🟡 | ☐ |
| M-03 | Android Studio Gradle sync fails | Version mismatch (Gradle, AGP, JDK). Record exact error. | 🟡 | ☐ |
| M-04 | Android emulator has no internet access | Auth and data calls fail; test with a device or configure emulator networking | 🟡 | ☐ |
| M-05 | Android back button behavior | Should navigate within app, not close it unexpectedly | 🟡 | ☐ |
| M-06 | Android keyboard covers input fields | `adjustResize` or scroll behavior needed; test sign-in and task forms | 🟡 | ☐ |
| M-07 | Android status bar overlaps app content | Safe area insets handled; content not hidden | 🟡 | ☐ |
| M-08 | Focus timer in background (Android) | Capacitor WebView may pause JS. Timer uses timestamps, so elapsed is correct on return, but display freezes. | 🟡 | ☐ |
| M-09 | App killed by Android OS while timer runs | Session data lost unless persisted. Document limitation. | 🟡 | ☐ |
| M-10 | No Android Studio / SDK / JDK installed | Document blocker; don't claim build succeeded | 🟡 | ☐ |
| M-11 | Signed release build without keystore setup | Build fails; document steps needed | 🟢 | ☐ |
| M-12 | App ID changed after initial build | May cause conflicts; clean build required | 🟢 | ☐ |

---

## 13. Concurrency & Race Conditions

| # | Edge Case | Expected Behavior | Severity | Status |
|---|---|---|---|---|
| RC-01 | Double-click "Create Task" button | Only one task created; button disabled during save | 🟡 | ☐ |
| RC-02 | Double-click "Complete Session" button | Only one session saved; button disabled during save | 🔴 | ☐ |
| RC-03 | Double-click "Delete Task" confirmation | Only one delete request; no error from deleting non-existent row | 🟡 | ☐ |
| RC-04 | Edit a task in two tabs simultaneously | Last save wins; no crash or data corruption | 🟡 | ☐ |
| RC-05 | Sign out while a save operation is in progress | Save may fail (session invalidated); no crash; redirect to sign-in | 🟡 | ☐ |
| RC-06 | Navigate away while an API call is loading | Component unmounts; async operation should not update unmounted state (React warning) | 🟡 | ☐ |
| RC-07 | Submit form, then immediately edit and re-submit | First submission completes; second overwrites — or queue/debounce | 🟢 | ☐ |
| RC-08 | Multiple rapid filter changes | Only final filter state is fetched; intermediate queries cancelled or ignored | 🟡 | ☐ |
| RC-09 | Page loads with stale React Query / SWR cache | Revalidate on mount; display fresh data | 🟢 | ☐ |

---

## Summary — Counts by Severity

| Severity | Count | Meaning |
|---|---|---|
| 🔴 **Critical** | 47 | Must fix before release |
| 🟡 **Important** | 73 | Should fix before release |
| 🟢 **Minor** | 30 | Can document as known issue |
| **Total** | **150** | |

---

## Testing Workflow

1. **During each day's implementation**, test the relevant edge cases from this document
2. **Mark status** as: ✅ Pass, ❌ Fail, ⚠️ Partial, or 🚫 Not applicable
3. **For failures**, create an entry in `docs/DAILY_LOG.md` → Blockers / Known Issues
4. **Critical failures** block the day's completion; fix before moving on
5. **Important failures** should be fixed if time permits; otherwise carry forward
6. **Minor failures** can be documented and deferred

---

*Edge cases are where bugs hide. Test honestly, report accurately, and fix what matters.*
