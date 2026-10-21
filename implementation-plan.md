# Kachuno — Implementation Plan

> **Version 1.0 · 21 October 2026**
> Derived from [architecture.md](file:///c:/Users/jatin/OneDrive/Documents/CODING-LIFE/Kachuno/architecture.md) and the 7-Day Project Blueprint

---

## How to Use This Plan

Each day is a **single focused work session**. Follow the steps sequentially within each day. Do not begin the next day until the current day's acceptance criteria are met and the owner explicitly approves.

> [!IMPORTANT]
> **Core rule:** Preserve a working application over chasing the schedule. If a day is not complete, document the blocker and carry unfinished work forward rather than marking it done.

---

## Pre-Implementation Checklist

Before starting Day 1, confirm all of the following:

- [ ] **Node.js** installed (check with `node -v`)
- [ ] **npm** or preferred package manager available
- [ ] **Git** installed and configured (`git --version`, `git config user.name`, `git config user.email`)
- [ ] **GitHub account** ready; repository will be created or already exists
- [ ] **Supabase account** created (free tier) — needed by Day 4
- [ ] **Vercel account** created (free tier) — needed by Day 7
- [ ] **Android Studio + SDK + JDK** (optional) — needed by Day 6 for Android build
- [ ] **Code editor** (VS Code / Antigravity IDE) ready
- [ ] This plan and `architecture.md` are accessible during development

---

## Day 1 — Foundation & UI Shell

**Goal:** Establish a running app with responsive navigation, design tokens, 5 placeholder screens, and project documentation.

### Step 1.1 — Repository Inspection

| Action | Command / Detail |
|---|---|
| Check if a repo exists | `ls` / inspect directory contents |
| Read `package.json` | Identify existing dependencies, scripts, and framework |
| Check Git status | `git status --short --branch` |
| Identify current branch | `git branch --show-current` |
| List existing files | Understand what to preserve vs. scaffold |

> [!WARNING]
> Do **not** overwrite existing user changes. If the working tree is dirty, report it and ask before editing.

**Decision gate:** If an app already exists, adapt. If not, scaffold fresh.

### Step 1.2 — Project Scaffolding (if needed)

```bash
# Only if no existing app:
npm create vite@latest ./ -- --template react-ts
npm install
```

- Verify `npm run dev` starts successfully on `localhost:5173`
- Verify `npm run build` completes without errors

### Step 1.3 — Styling Setup

**Choose ONE** based on existing repo state:

| Option | Setup |
|---|---|
| **Tailwind CSS** | `npm install -D tailwindcss @tailwindcss/vite` → configure `vite.config.ts` and `index.css` |
| **Custom CSS** | Create `src/styles/` with token files |

### Step 1.4 — Design Tokens

Create the Kachuno visual identity system:

```
Token              Value
─────────────────  ──────────────────────────────
Primary            Deep forest green (#1B4332 or similar)
Primary Light      Muted sage (#52796F or similar)
Secondary          Warm amber accent
Background         Warm neutral (#FAF6F1 or similar)
Surface            White / light card surface
Text Primary       Dark, readable (#1A1A2E or similar)
Text Secondary     Muted gray
Border             Subtle gray border
Focus Ring         Visible, high-contrast ring
Spacing Scale      4px base (4, 8, 12, 16, 24, 32, 48, 64)
Border Radius      8px default, 12px cards, 50% circular
Font Family        Inter or system-ui stack
Motif              Subtle turtle shell geometry — NOT cartoon
```

### Step 1.5 — App Shell & Navigation

Create these files:

| File | Purpose |
|---|---|
| `src/App.tsx` | Root with routing |
| `src/app/AppShell.tsx` | Layout wrapper with sidebar/bottom nav |
| `src/app/AppRouter.tsx` | Route definitions for 5 screens |
| `src/components/Sidebar.tsx` | Desktop sidebar navigation |
| `src/components/MobileNav.tsx` | Bottom navigation for mobile |

**Navigation items** (use Lucide React icons with accessible labels):

| Screen | Icon | Route |
|---|---|---|
| My Day | `Sun` | `/` |
| Tasks | `CheckSquare` | `/tasks` |
| Calendar | `Calendar` | `/calendar` |
| Focus | `Clock` | `/focus` |
| Progress | `BarChart3` | `/progress` |

**Requirements:**
- Current section is visually indicated
- Keyboard-navigable with visible focus rings
- Responsive: sidebar on desktop (≥768px), bottom nav on mobile (<768px)

### Step 1.6 — Placeholder Screens

Create 5 placeholder page components:

```
src/features/my-day/MyDayPage.tsx
src/features/tasks/TasksPage.tsx
src/features/calendar/CalendarPage.tsx
src/features/focus/FocusPage.tsx
src/features/progress/ProgressPage.tsx
```

Each placeholder must:
- Have a descriptive heading and helpful empty-state copy
- Label planned/unfinished features honestly (e.g., "Task management coming soon")
- Show **no** fake metrics, demo data, or hard-coded numbers
- Be responsive at 375px / 768px / 1280px

### Step 1.7 — Project Documentation

| File | Content |
|---|---|
| `README.md` | Project overview, tagline, stack, prerequisites, setup commands, env var names, current status |
| `docs/DAILY_LOG.md` | Daily log template (from blueprint section 10) |
| `docs/ARCHITECTURE.md` | Copy or link the architecture document |
| `.env.example` | `VITE_SUPABASE_URL=https://your-project.supabase.co` and `VITE_SUPABASE_ANON_KEY=your-anon-key-here` |
| `.gitignore` | Must include: `.env`, `.env.local`, `.env.*`, `!.env.example`, `node_modules/`, `dist/`, `android/`, `*.keystore`, `local.properties` |

### Step 1.8 — Verification

| Test | Expected Result | Status |
|---|---|---|
| `npm install` | No errors | [x] |
| `npm run dev` | Dev server starts, app loads | [x] |
| `npm run build` | Production build succeeds | [x] |
| Navigate all 5 screens | Routes work, active state shown | [x] |
| Test at ~375px width | Mobile nav, no overflow | [x] |
| Test at ~768px width | Layout transition works | [x] |
| Test at ~1280px width | Desktop sidebar visible | [x] |
| Keyboard tab through nav | Visible focus, all items reachable | [x] |
| Browser console | No errors from new code | [x] |
| No fake metrics visible | Confirmed | [x] |

### Day 1 Commit

```
chore: set up Kachuno app shell and responsive design
```

---

## Day 2 — Task Management

**Goal:** Full task CRUD with validation, filters, status transitions, and My Day screen driven by real task data.

### Step 2.1 — Type Definitions

Create `src/types/task.ts`:

```typescript
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'study' | 'work' | 'personal' | 'projects';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;        // 'YYYY-MM-DD' date-only
  priority: Priority;
  category: Category;
  is_completed: boolean;
  completed_at: string | null;    // ISO timestamptz
  created_at: string;
  updated_at: string;
}
```

### Step 2.2 — Temporary Data Layer

Create `src/features/tasks/taskService.ts`:

- Use **in-memory array** or **localStorage** as temporary adapter
- Clearly label as temporary (replaced by Supabase on Day 4)
- Keep the interface clean so it's easy to swap:

```typescript
// Interface to implement (will be backed by Supabase on Day 4):
getTasks(filters?: TaskFilters): Promise<Task[]>
createTask(input: CreateTaskInput): Promise<Task>
updateTask(id: string, input: UpdateTaskInput): Promise<Task>
deleteTask(id: string): Promise<void>
toggleComplete(id: string): Promise<Task>
```

### Step 2.3 — Task Form

Create `src/features/tasks/TaskForm.tsx`:

| Field | Type | Validation |
|---|---|---|
| Title | text input | Required, trimmed, non-empty, max ~160 chars |
| Description | textarea | Optional, max length |
| Due date | date picker | Optional, `YYYY-MM-DD` |
| Priority | select | Required, default `medium` |
| Category | select | Required |

- Show inline validation errors
- Prevent submission of invalid data
- Clear form on successful create
- Populate form for edit mode

### Step 2.4 — Task List & Cards

Create `src/features/tasks/TaskList.tsx` and `TaskCard.tsx`:

Each task card shows:
- [ ] Completion checkbox (keyboard accessible)
- Title + priority badge + category tag
- Due date (with overdue styling if applicable)
- Edit button → opens form in edit mode
- Delete button → confirmation dialog before delete

### Step 2.5 — Task Filters

Create `src/features/tasks/TaskFilters.tsx`:

| Filter | Options |
|---|---|
| Status | All / Incomplete / Completed |
| Priority | All / Low / Medium / High |
| Category | All / Study / Work / Personal / Projects |
| Due date | All / Today / Overdue / This week / No date |

- Filters combine with **AND** semantics
- Show active filter count
- "Clear all filters" action
- Show "No tasks match filters" when empty

### Step 2.6 — Task State Transitions

| Action | State Change |
|---|---|
| **Complete** | `is_completed = true`, `completed_at = now()` |
| **Reopen** | `is_completed = false`, `completed_at = null` |
| **Delete** | Remove from list, confirm first, preserve linked focus sessions (clear `task_id`) |

### Step 2.7 — My Day Screen

Update `src/features/my-day/MyDayPage.tsx` to derive from real task data:

| Section | Data Source |
|---|---|
| Due today (incomplete) | Tasks where `due_date === today` AND `is_completed === false` |
| Overdue | Tasks where `due_date < today` AND `is_completed === false` |
| Completed today | Tasks where `completed_at` is today |
| Counts | Derived from above — no hard-coded values |
| Focus time | Show "Focus tracking available soon" placeholder (until Day 3) |

### Step 2.8 — Date Helpers

Create `src/lib/dates.ts`:

```typescript
getLocalToday(): string           // 'YYYY-MM-DD'
isOverdue(dueDate: string): boolean
isDueToday(dueDate: string): boolean
formatDisplayDate(date: string): string
```

> [!CAUTION]
> Treat `due_date` as a date-only string (`YYYY-MM-DD`). Never convert it to a UTC `Date` object for display — this causes off-by-one timezone bugs.

### Step 2.9 — Verification

| Test | Expected Result | Status |
|---|---|---|
| Create task with only title | Works, defaults applied | ☐ |
| Create task with all fields | All fields saved correctly | ☐ |
| Reject whitespace-only title | Validation error shown | ☐ |
| Edit every field | Changes persist | ☐ |
| Complete → reopen task | `completed_at` set/cleared correctly | ☐ |
| Delete task + cancel confirmation | Task survives cancellation | ☐ |
| Delete task + confirm | Task removed from all views | ☐ |
| Combine filters (category + priority + status) | AND semantics work | ☐ |
| Clear filters | Full list returns | ☐ |
| Task with no due date | Visible in Tasks, not in "due today" | ☐ |
| Task due today | Appears in My Day | ☐ |
| Task due yesterday (incomplete) | Appears as overdue | ☐ |
| Completed overdue task | NOT counted as overdue | ☐ |
| `npm run build` | Passes | ☐ |
| Reload behavior | Matches documented storage (temp/local) | ☐ |

### Day 2 Commit

```
feat: add task management and filters
```

---

## Day 3 — Calendar & Focus Timer

**Goal:** Monthly/weekly calendar views linked to task due dates, and an accurate timestamp-based focus timer with session saving.

### Step 3.1 — Date Utility Expansion

Extend `src/lib/dates.ts`:

```typescript
getMonthDays(year: number, month: number): Date[]
getWeekDays(startDate: string): string[]
getStartOfWeek(date: string): string     // Decide: Monday or Sunday start
getMonthBoundaries(year: number, month: number): { start: string; end: string }
isSameDay(a: string, b: string): boolean
```

**Document the week-start convention** (Monday vs Sunday) and use it consistently.

### Step 3.2 — Calendar Month View

Create `src/features/calendar/CalendarGrid.tsx`:

- Display a 7-column grid for the month
- Show previous/next month navigation
- Highlight today's date
- Show dot indicators on days with tasks
- Clicking a date selects it and shows that day's tasks
- Accessible: date cells have labels, keyboard navigable

### Step 3.3 — Calendar Week View

Create `src/features/calendar/WeekView.tsx`:

- 7-day horizontal strip
- Previous/next week navigation
- Tasks listed under each day
- Selecting a day expands its task list

### Step 3.4 — Calendar Page Assembly

Create `src/features/calendar/CalendarPage.tsx`:

- Toggle between Month and Week views
- Toolbar with view switcher + navigation controls
- Selected date state → filtered task list below
- Tasks without due dates do **not** appear on calendar days
- Clicking a task allows opening/editing it

### Step 3.5 — Focus Timer Type Definitions

Create `src/types/focus.ts`:

```typescript
export type TimerState = 'idle' | 'running' | 'paused' | 'saving' | 'error';

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;       // ISO timestamptz
  ended_at: string | null;  // ISO timestamptz
  duration_seconds: number;
  task_id: string | null;
  status: 'completed' | 'cancelled';
  created_at: string;
}
```

### Step 3.6 — Focus Timer Hook

Create `src/features/focus/useFocusTimer.ts`:

**State machine transitions:**

```
idle → running        (Start)
running → paused      (Pause)
paused → running      (Resume)
running → saving      (Complete)
paused → saving       (Complete)
running → idle        (Reset — confirm if elapsed > 0)
paused → idle         (Reset — confirm if elapsed > 0)
saving → idle         (Success)
saving → error        (Failure)
error → saving        (Retry)
error → idle          (Discard)
```

**Critical implementation rules:**
- Store `startTimestamp` and `accumulatedPausedMs` — do NOT count UI ticks
- On pause: `accumulatedElapsed = Date.now() - startTimestamp - totalPausedMs`
- On resume: record new segment start
- Display interval (`setInterval`) refreshes the UI but is **not** the source of elapsed truth
- Minimum session: 1 second. Reject 0 or negative durations

### Step 3.7 — Focus Page UI

Create `src/features/focus/FocusPage.tsx`:

| Element | Detail |
|---|---|
| Timer display | `MM:SS` or `HH:MM:SS` format, large and prominent |
| Task selector | Optional dropdown to link a task to the session |
| Start button | Visible when `idle` |
| Pause / Resume | Toggle when `running` / `paused` |
| Complete button | Available when `running` or `paused`; disabled during `saving` |
| Reset button | Available when `running` or `paused`; confirm if elapsed > 0 |
| Save feedback | Show "Saving…" during save, "Saved!" on success, error + retry on failure |

### Step 3.8 — Focus Session Service

Create `src/features/focus/focusSessionService.ts`:

```typescript
// Temporary adapter (replaced by Supabase on Day 4):
saveFocusSession(session: CreateFocusSessionInput): Promise<FocusSession>
getFocusSessions(): Promise<FocusSession[]>
```

- **Prevent duplicate saves:** disable the complete button while saving; guard with a flag
- **Never display "saved" before the write succeeds**

### Step 3.9 — Session History (Foundation)

Create a basic session history list or data foundation for Day 5:

- List completed sessions with date, duration, and linked task name
- This can be minimal — the full progress view is built on Day 5

### Step 3.10 — Verification

| Test | Expected Result | Status |
|---|---|---|
| Calendar: 28/29/30/31-day months render correctly | All days visible | ☐ |
| Calendar: year boundary (Dec → Jan) | Navigation works | ☐ |
| Calendar: month starting on different weekdays | Grid aligns correctly | ☐ |
| Task appears on correct due date | Matches `due_date` field | ☐ |
| Selecting a date shows that day's tasks | Filtered list matches | ☐ |
| Tasks without `due_date` | Not on any calendar day | ☐ |
| Timer: start → pause → resume → complete | All transitions work | ☐ |
| Timer: paused time not counted | Elapsed excludes pauses | ☐ |
| Timer: background tab behavior | Elapsed stays accurate via timestamps | ☐ |
| Timer: complete saves session | Correct `started_at`, `ended_at`, `duration_seconds` | ☐ |
| Timer: linked task is optional | Can save with or without task | ☐ |
| Timer: double-click complete | No duplicate sessions | ☐ |
| Timer: failed save | Error shown, retry available | ☐ |
| Timer: reset with elapsed > 0 | Confirmation prompt | ☐ |
| `npm run build` | Passes | ☐ |

### Day 3 Commit

```
feat: add calendar and focus timer
```

---

## Day 4 — Supabase & Authentication

**Goal:** Connect Supabase Auth and PostgreSQL, create schema + RLS migrations, replace temporary storage, and verify two-account data isolation.

### Step 4.1 — Supabase Project Setup

- Create or inspect the Supabase project using the user's account
- Note the project URL and anon key
- **Never** request or store the service-role key in frontend files

### Step 4.2 — Environment Variables

1. Add to `.env.local` (never committed):
   ```
   VITE_SUPABASE_URL=https://your-actual-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

2. Verify `.env.local` is in `.gitignore` **before** staging anything

3. Confirm `.env.example` has placeholders only

### Step 4.3 — Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env.local and add your project values.'
  );
}

export const supabase = createClient(url, key);
```

Install the SDK:
```bash
npm install @supabase/supabase-js
```

### Step 4.4 — Database Migrations

Create SQL migration files in `supabase/migrations/` (or `supabase/schema.sql`):

**Migration 001 — Tasks table:**
```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 160),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 2000),
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL CHECK (category IN ('study', 'work', 'personal', 'projects')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_completed ON public.tasks(user_id, is_completed);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Migration 002 — Focus sessions table:**
```sql
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_focus_user_started ON public.focus_sessions(user_id, started_at);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own focus sessions" ON public.focus_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Migration 003 — Updated_at trigger:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

> [!IMPORTANT]
> Review all SQL before running it in the Supabase SQL editor. Run migrations one at a time and verify each.

### Step 4.5 — Authentication UI

Create these files:

| File | Purpose |
|---|---|
| `src/features/auth/AuthProvider.tsx` | Context provider — manages session state, loading, `onAuthStateChange` listener |
| `src/features/auth/SignInPage.tsx` | Email + password sign-in form with validation + error messages |
| `src/features/auth/SignUpPage.tsx` | Email + password sign-up form with validation + error messages |
| `src/features/auth/ProtectedRoute.tsx` | Wrapper that redirects to sign-in if no session |

**Auth flow requirements:**
- Show loading state while checking session
- Handle expired sessions gracefully (redirect to sign-in)
- Clear, user-friendly error messages (don't expose backend details)
- Sign-out button in navigation/profile area

### Step 4.6 — Replace Temporary Storage

Update `taskService.ts` and `focusSessionService.ts`:

- Replace in-memory/localStorage calls with Supabase queries
- Include `user_id` in all inserts (set to `supabase.auth.getUser()` result)
- RLS enforces ownership; UI should still include `user_id` in queries for clarity
- Preserve the same function signatures — UI code should need minimal changes

### Step 4.7 — Two-Account Isolation Test

Execute the full protocol from [architecture.md § Security Architecture](file:///c:/Users/jatin/OneDrive/Documents/CODING-LIFE/Kachuno/architecture.md):

| Step | Action | Expected |
|---|---|---|
| 1 | Create accounts A and B | Both registered |
| 2 | Sign in as A → create 2+ tasks, 1 focus session | Data saved |
| 3 | Sign out → sign in as B | B sees **zero** records from A |
| 4 | As B, query A's known IDs | Returns empty |
| 5 | As B, update/delete A's records | Rejected |
| 6 | As B, insert with `user_id = A` | Rejected by RLS |
| 7 | Sign back in as A | A's records intact |

> Record exact results for each step. This is a **required** security verification.

### Step 4.8 — Verification

| Test | Expected Result | Status |
|---|---|---|
| Missing env vars → clear setup message | Not a blank screen | ☐ |
| Sign-up with valid credentials | Account created | ☐ |
| Sign-in with valid credentials | Session established | ☐ |
| Sign-in with invalid credentials | Clear error shown | ☐ |
| Session restore on reload | User stays signed in | ☐ |
| Sign-out | Redirected to sign-in | ☐ |
| Task CRUD persists after reload | Data in Supabase | ☐ |
| Focus session saves to Supabase | Verified in DB | ☐ |
| Two-account isolation (all 7 steps) | All pass | ☐ |
| RLS enabled on both tables | Confirmed in Supabase dashboard | ☐ |
| `git diff` — no secrets in tracked files | Confirmed | ☐ |
| `npm run build` | Passes | ☐ |

### Day 4 Commit

```
feat: connect Supabase auth and persistence
```

---

## Day 5 — Progress Dashboard & History

**Goal:** Build task/focus history views, implement transparent metrics with documented formulas, and handle all edge cases including empty periods.

### Step 5.1 — Period Selector

Create a shared period selector component used across the Progress page:

| Period Option | Range Definition |
|---|---|
| Today | Current local date only |
| This week | Monday–Sunday (or chosen convention) |
| Last 7 days | Today minus 6 days through today |
| This month | 1st of current month through today |

> [!IMPORTANT]
> Use **one consistent definition** across all labels, calculations, and tests. Display boundaries explicitly in the UI (e.g., "This week: Mon 20 Oct – Sun 26 Oct").

### Step 5.2 — Metric Calculation Helpers

Create `src/features/progress/metrics.ts`:

```typescript
/**
 * Completion rate = (completed in period / created in period) × 100
 * Zero denominator → return null (display "No tasks in this period")
 */
function completionRate(tasks: Task[], period: DateRange): number | null

/**
 * Overdue count = incomplete tasks where due_date < today
 * This is a CURRENT SNAPSHOT, not period-based
 */
function overdueCount(tasks: Task[]): number

/**
 * Focus minutes = SUM(duration_seconds) for completed sessions
 * where ended_at falls inside the selected period, divided by 60
 * Display rounded minutes; store exact seconds
 */
function focusMinutes(sessions: FocusSession[], period: DateRange): number

/**
 * Weekly trend = array of 7 daily values (completed task count or focus minutes)
 * Zero-activity days are 0, NOT omitted or fabricated
 */
function weeklyTrend(data: Task[] | FocusSession[], week: DateRange): number[]
```

### Step 5.3 — Task History View

Create `src/features/progress/TaskHistory.tsx`:

- List completed tasks with `completed_at` date
- Distinguish "completed in period" from "currently completed"
- Show task title, category, priority, completion date
- Empty state: "No tasks completed in this period"

### Step 5.4 — Focus History View

Create `src/features/progress/FocusHistory.tsx`:

- List completed focus sessions
- Show: date/time, duration (formatted), linked task name (if any)
- Empty state: "No focus sessions in this period"

### Step 5.5 — Progress Dashboard Assembly

Create `src/features/progress/ProgressPage.tsx`:

| Section | Content |
|---|---|
| **Summary cards** | Completion rate %, overdue count, focus minutes total |
| **Weekly trend** | Bar chart or compact visualization — 7 values including zeros |
| **Task history** | Filterable list of completed tasks |
| **Focus history** | List of focus sessions |

**Visualization rules:**
- Use accessible, simple bars/charts
- Include text labels (don't rely on color alone)
- Overdue count is shown **separately** from period metrics (different meaning)
- No-data → neutral empty state, never invented values

### Step 5.6 — Update My Day

Update `src/features/my-day/MyDayPage.tsx` to include:
- Today's focus minutes (from completed sessions where `ended_at` is today)
- Replace the "coming soon" placeholder with real data

### Step 5.7 — Verification

| Test | Expected Result | Status |
|---|---|---|
| No tasks in period | "No tasks in this period" — no divide-by-zero | ☐ |
| 1 task, incomplete | 0% completion rate | ☐ |
| 1 task, completed | 100% completion rate | ☐ |
| Completed task created outside period | Excluded from rate calculation | ☐ |
| Focus session at period boundary | Correct inclusion/exclusion | ☐ |
| Zero activity on a weekday | Displays as 0 in trend, not omitted | ☐ |
| Overdue count excludes completed tasks | Confirmed | ☐ |
| Overdue count excludes tasks due today | Confirmed | ☐ |
| Period labels match calculations | Boundaries are explicit and consistent | ☐ |
| Hand-calculated sample matches displayed values | Verified | ☐ |
| `npm run build` | Passes | ☐ |

### Day 5 Commit

```
feat: add progress dashboard and history
```

---

## Day 6 — Responsive Polish & Android

**Goal:** Accessibility audit, responsive fixes, Capacitor configuration, and a debug Android build attempt.

### Step 6.1 — Responsive Audit

Test every screen at three widths:

| Width | Represents | Check |
|---|---|---|
| ~375px | Phone | Navigation, forms, modals, timer, calendar, cards |
| ~768px | Tablet | Layout transition, sidebar/bottom nav switch |
| ~1280px | Desktop | Full sidebar, comfortable spacing |

**Fix:**
- Horizontal scroll (except intentional)
- Uncomfortable tap targets (minimum 44×44px)
- Dialogs that overflow viewport
- On-screen keyboard hiding form controls
- Calendar grid not fitting narrow screens

### Step 6.2 — Accessibility Audit

| Check | How | Fix |
|---|---|---|
| Keyboard navigation | Tab through everything | Add `tabindex`, fix focus order |
| Focus indicators | Visual inspection | Ensure `:focus-visible` rings |
| Semantic headings | Check heading hierarchy | Single `<h1>` per page, proper `<h2>`–`<h6>` |
| Form labels | Inspect all `<input>` elements | Add `<label>` or `aria-label` |
| Button names | Check icon-only buttons | Add `aria-label` text |
| Color contrast | Use browser dev tools | Meet WCAG AA (4.5:1 text, 3:1 large text) |
| Screen reader status | Check timer, errors, saving | Use `aria-live` regions |

### Step 6.3 — State Review

Verify all screens handle these states:

| State | UX |
|---|---|
| Loading | Skeleton/spinner |
| Empty | Helpful message + action CTA |
| Error (network) | Clear message + retry |
| Error (form) | Inline field errors |
| Session expired | Redirect to sign-in with message |
| Saving | Disabled button + indicator |

### Step 6.4 — Dependency Cleanup

```bash
npm ls --depth=0     # List top-level dependencies
```

- Remove only packages proven unused and safe to remove
- Verify build still passes after each removal

### Step 6.5 — Capacitor Setup

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Kachuno" "com.yourname.kachuno" --web-dir dist
npm install @capacitor/android
npx cap add android
```

> [!WARNING]
> Replace `com.yourname.kachuno` with a reverse-domain identifier you control. This cannot easily be changed after Play Store submission.

Configure `capacitor.config.ts`:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.kachuno',
  appName: 'Kachuno',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Step 6.6 — Android Build Attempt

```bash
npm run build                # Build web assets first
npx cap sync android         # Sync web assets to Android project
npx cap open android         # Open in Android Studio
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Test on emulator or connected device

**If environment is missing:**
- Document exactly what's missing (Android Studio, SDK, JDK version)
- Record the error message
- Do NOT claim Android works based only on a successful web build

### Step 6.7 — Android Testing (if build succeeds)

| Test | Status |
|---|---|
| App opens to sign-in | ☐ |
| Login works | ☐ |
| Task CRUD works | ☐ |
| Calendar renders correctly | ☐ |
| Timer runs accurately | ☐ |
| Progress page loads | ☐ |
| Keyboard doesn't hide inputs | ☐ |
| Safe area / status bar handled | ☐ |

### Step 6.8 — Verification

| Test | Expected Result | Status |
|---|---|---|
| Responsive at 375px, 768px, 1280px | No layout breakage | ☐ |
| All tap targets ≥ 44px | Comfortable on mobile | ☐ |
| Keyboard-only navigation complete | All actions reachable | ☐ |
| `npm run build` | Passes | ☐ |
| `npm run lint` (if configured) | Passes or issues documented | ☐ |
| Android build status | Documented (success or precise blocker) | ☐ |

### Day 6 Commit

```
feat: package Android app and improve responsive UX
```

---

## Day 7 — Deployment & Final Verification

**Goal:** Deploy to Vercel, attempt Android release build, complete all documentation, fill out acceptance checklist with evidence.

### Step 7.1 — Final Code Review

- [ ] Review full `git diff` — no unrelated files or secrets staged
- [ ] Search for TODO/FIXME markers — resolve or document
- [ ] Review all known issues from daily logs
- [ ] Confirm no service-role key, `.env`, tokens, or signing credentials in tracked files

### Step 7.2 — Build Verification

```bash
npm run lint          # If configured
npm run typecheck     # If configured (tsc --noEmit)
npm test              # If tests exist
npm run build         # Production build
```

Record exact commands, exit status, and key output for each.

### Step 7.3 — Vercel Deployment

1. **Connect GitHub repo** to Vercel
   - Confirm framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Set environment variables** in Vercel project settings:
   - `VITE_SUPABASE_URL` → your project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
   - **Never add** service-role key

3. **Deploy preview first** if available

4. **Configure Supabase:**
   - Add deployed URL to Supabase Auth → URL Configuration → Site URL
   - Add deployed URL to Redirect URLs allowlist

### Step 7.4 — Production Verification

Test the **deployed URL** (not localhost) in a fresh/incognito browser session:

| Test | Status |
|---|---|
| Sign-up works | ☐ |
| Sign-in works | ☐ |
| Task CRUD works | ☐ |
| Calendar dates correct | ☐ |
| Focus session saves | ☐ |
| Progress page loads and calculates | ☐ |
| Responsive on mobile viewport | ☐ |
| Error states handled | ☐ |
| Auth redirect works (not loops) | ☐ |
| RLS verified on production | ☐ |
| No secrets exposed in built assets | ☐ |

### Step 7.5 — Android Release Build (If Possible)

| Build Type | Artifact | Purpose |
|---|---|---|
| Debug APK | `app-debug.apk` | Dev testing only |
| Signed Release APK | `app-release.apk` | Direct install testing |
| Signed AAB | `app-release.aab` | Google Play submission |

> [!CAUTION]
> Do NOT commit signing keystores or passwords to Git. If signing setup is incomplete, document the blocker — do not claim the release build exists.

### Step 7.6 — Final Documentation

Update all documentation to match actual state:

| Document | Update |
|---|---|
| `README.md` | Setup instructions, env vars, SQL migration steps, test commands, deployment URL, Android build status, known issues |
| `docs/ARCHITECTURE.md` | Verify it matches the implemented architecture |
| `docs/DAILY_LOG.md` | All 7 day entries completed with actual results |
| `docs/TEST_PLAN.md` | Documented test scenarios and results |

### Step 7.7 — Google Play Preparation Notes

Document remaining steps (do not promise completion):

- [ ] Google Play developer registration ($25 fee)
- [ ] App identity: name, package ID, description
- [ ] Store listing: screenshots, feature graphic, short/long description
- [ ] Privacy policy URL (required — must match actual data handling)
- [ ] Data safety declarations
- [ ] Content rating questionnaire
- [ ] Target API level compliance
- [ ] App signing enrollment
- [ ] Testing track (internal/closed/open) before production release
- [ ] Review timeline is outside developer control

### Step 7.8 — Final Acceptance Checklist

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Authentication works | Sign-up, sign-in, session restore, sign-out verified | ☐ Pass ☐ Fail ☐ Not verified |
| 2 | Task operations work | CRUD, due date, priority, category, filters tested | ☐ Pass ☐ Fail ☐ Not verified |
| 3 | Calendar dates match due dates | Month/week views, timezone boundaries tested | ☐ Pass ☐ Fail ☐ Not verified |
| 4 | Focus sessions save accurately | Timing, persistence, duplicate prevention tested | ☐ Pass ☐ Fail ☐ Not verified |
| 5 | Progress calculations correct | Hand-calculated samples verified | ☐ Pass ☐ Fail ☐ Not verified |
| 6 | RLS prevents cross-account access | Two-account isolation test passed | ☐ Pass ☐ Fail ☐ Not verified |
| 7 | Mobile layout is usable | 375px, 768px, 1280px checked | ☐ Pass ☐ Fail ☐ Not verified |
| 8 | Web deployment verified | Deployed URL tested in clean session | ☐ Pass ☐ Fail ☐ Not verified |
| 9 | Android build documented | Build type, result, and test recorded | ☐ Pass ☐ Fail ☐ Not verified |
| 10 | GitHub contains no secrets | Tracked files + diff scanned | ☐ Pass ☐ Fail ☐ Not verified |
| 11 | Documentation complete | README, architecture, test plan, daily logs | ☐ Pass ☐ Fail ☐ Not verified |

### Step 7.9 — Final Commit & Push

```bash
git status --short --branch
git diff
git diff --staged
# Stage only intended files:
git add src/ docs/ README.md capacitor.config.ts .env.example .gitignore
git diff --staged
# Propose commit message — WAIT FOR APPROVAL:
git commit -m "docs: finalize deployment and project documentation"
git rev-parse --short HEAD
git status --short --branch
# WAIT FOR EXPLICIT PUSH APPROVAL:
git push
```

### Day 7 Commit

```
docs: finalize deployment and project documentation
```

---

## Quick Reference — File Creation Timeline

| Day | Files Created |
|---|---|
| **1** | `App.tsx`, `AppShell.tsx`, `AppRouter.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, 5 page placeholders, styles/tokens, `README.md`, `docs/DAILY_LOG.md`, `docs/ARCHITECTURE.md`, `.env.example`, `.gitignore` |
| **2** | `types/task.ts`, `taskService.ts`, `TaskForm.tsx`, `TaskList.tsx`, `TaskCard.tsx`, `TaskFilters.tsx`, `MyDayPage.tsx` (updated), `dates.ts` |
| **3** | `CalendarGrid.tsx`, `WeekView.tsx`, `CalendarPage.tsx`, `CalendarToolbar.tsx`, `types/focus.ts`, `useFocusTimer.ts`, `FocusPage.tsx`, `focusSessionService.ts` |
| **4** | `supabase.ts`, `AuthProvider.tsx`, `SignInPage.tsx`, `SignUpPage.tsx`, `ProtectedRoute.tsx`, `migrations/*.sql`, updated `taskService.ts`, updated `focusSessionService.ts` |
| **5** | `metrics.ts`, `ProgressPage.tsx`, `TaskHistory.tsx`, `FocusHistory.tsx`, `WeeklyTrend.tsx`, updated `MyDayPage.tsx` |
| **6** | `capacitor.config.ts`, `android/` (generated), style/accessibility fixes across all components |
| **7** | Documentation updates, `docs/TEST_PLAN.md`, final `README.md` |

---

## Troubleshooting Reference

| Problem | Likely Cause | Fix |
|---|---|---|
| Blank screen | Entry point import error, missing route fallback | Check browser console + terminal |
| Date shifts by one day | UTC conversion of date-only string | Use `YYYY-MM-DD` as string, don't convert to `Date` for display |
| Timer loses time in background | Counting `setInterval` ticks | Use timestamp math instead |
| RLS returns no rows | Wrong policy, missing session, or wrong `user_id` | Check auth state + policy + row ownership |
| Insert rejected | Missing required field, invalid enum value, or FK violation | Check constraint errors |
| Auth redirect loops | Session loading check missing before route decision | Add loading state check |
| Env var changes don't appear | Vite cache / Vercel needs redeploy | Restart dev server / redeploy |
| Capacitor sync fails | Wrong `webDir`, version mismatch | Check `dist/` exists, package versions |
| Android SDK missing | Not installed | Document requirement, don't fake the build |
| Build fails on Vercel but not locally | Different Node version, missing env vars | Compare environments |

---

*This plan is a guide, not a contract. Adapt to reality, document deviations, and never report optimism as evidence.*
