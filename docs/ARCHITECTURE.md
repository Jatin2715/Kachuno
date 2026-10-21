# Kachuno — Architecture Documentation

For the complete technical blueprint and design specifications, refer to [architecture.md](../architecture.md) and [implementation-plan.md](../implementation-plan.md).

## Summary Architecture

```
Client Layer (React 19 + TypeScript + Vite)
 ├── AppShell (Responsive Sidebar / Bottom Mobile Nav)
 ├── NavigationProvider (Hash & Path Resilient Routing)
 ├── Feature Modules (My Day, Tasks, Calendar, Focus, Progress)
 └── Design System (src/styles/tokens.css, layout.css)

Backend & Persistence Layer (Supabase)
 ├── Supabase Auth (Email / Password JWT sessions)
 ├── PostgreSQL Database (tasks, focus_sessions)
 └── Row Level Security (auth.uid() = user_id strict isolation)

Hosting & Mobile Packaging
 ├── Web: Vercel Static Hosting (SPA)
 └── Mobile: Capacitor Android (WebView wrapper with safe-area insets)
```

## Core Principles
1. **Calm, deliberate aesthetic:** Forest greens, muted sage, warm amber, and warm neutrals.
2. **Zero fake metrics:** Never render hard-coded mock stats or artificial streaks.
3. **Wall-clock timing:** Focus timer relies on timestamp deltas (`Date.now() - startedAt`), eliminating background sleep drift.
4. **Resilient data isolation:** RLS enforced on all tables, guaranteed multi-tenant safety.
