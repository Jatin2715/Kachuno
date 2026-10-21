# Kachuno (કાચબો) 🐢

> **Slow, steady, and deliberate productivity.**  
> Inspired by the wisdom of the tortoise: consistent, intentional progress over frenzied burnout.

---

## Overview

Kachuno is a thoughtful productivity web and mobile application designed to help students, creators, and professionals organize their commitments, sustain deep attention, and track genuine progress.

Unlike noisy productivity apps loaded with gamified gimmicks and fake streaks, Kachuno emphasizes:
- **Calm Visual Identity:** Grounded forest greens (`#1B4332`), sage accents, warm amber highlights, and warm organic neutrals.
- **Deliberate Daily Planning:** Focus on 3–5 essential daily priorities rather than endless backlogs.
- **Mathematical Honesty:** Progress metrics and charts reflect verified real data — zero fake metrics or placeholder stats.
- **Wall-Clock Timing:** Deep work focus timer resilient to background tab throttling and device sleep.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vite.dev/) |
| **Styling & Tokens** | Custom CSS Design Tokens & Layout (`src/styles/`) |
| **Icons** | [Lucide React](https://lucide.dev/) (with accessible labels) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security) |
| **Mobile Distribution** | [Capacitor](https://capacitorjs.com/) (Android WebView with safe-area insets) |
| **Hosting** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
Kachuno/
├── .env.example                # Supabase configuration template
├── architecture.md             # Full architectural blueprint
├── implementation-plan.md      # 7-Day implementation roadmap
├── edge-cases.md               # 150 edge-case test matrix
├── docs/
│   ├── ARCHITECTURE.md         # Architecture summary
│   └── DAILY_LOG.md            # Daily dev logs and milestones
├── public/
│   └── favicon.svg             # Turtle shell geometry insignia
└── src/
    ├── app/
    │   ├── AppRouter.tsx       # Route definitions & navigation state
    │   └── AppShell.tsx        # Responsive layout shell (Sidebar / MobileNav)
    ├── components/
    │   ├── MobileNav.tsx       # Bottom bar navigation (< 768px)
    │   └── Sidebar.tsx         # Desktop sidebar navigation (≥ 768px)
    ├── features/
    │   ├── calendar/CalendarPage.tsx
    │   ├── focus/FocusPage.tsx
    │   ├── my-day/MyDayPage.tsx
    │   ├── progress/ProgressPage.tsx
    │   └── tasks/TasksPage.tsx
    ├── styles/
    │   ├── layout.css          # App layout, grid, cards, responsive media queries
    │   └── tokens.css          # Design tokens (colors, spacing, shadows, radius)
    ├── App.tsx                 # Root application wrapper
    ├── index.css               # Token imports and global styles
    └── main.tsx                # Entry point
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v26+ supported)
- **npm**: v9.0.0 or later

### Installation

1. **Clone and enter the directory:**
   ```bash
   cd Kachuno
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional for Day 1 shell):**
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 7-Day Roadmap Status

- [x] **Day 1: Foundation & UI Shell** (Completed)
- [ ] **Day 2: Task Management & My Day** (Planned)
- [ ] **Day 3: Calendar Views** (Planned)
- [ ] **Day 4: Backend, Auth & Cloud Sync** (Planned)
- [ ] **Day 5: Focus Timer & Progress Analytics** (Planned)
- [ ] **Day 6: Mobile Hardening & Android Build** (Planned)
- [ ] **Day 7: Production Release & Delivery** (Planned)

---

## License

Private & Proprietary © 2026 Kachuno Project.
