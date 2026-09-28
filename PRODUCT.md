# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Primary: University students (mahasiswa) managing their semester workloads, lecture schedules, assignment deadlines, exam preparations, GPA targets, and daily study focus sessions.

## Product Purpose

An all-in-one, lightweight personal academic companion app that keeps students organized, reduces academic anxiety, and keeps critical study schedules and assignments within immediate reach, with fast local access and cloud sync.

## Positioning

A focused, lightweight, and cohesive student-first organizer specifically built for Indonesian university life (mata kuliah, SKS, IPK, jadwal, tugas) combining daily task tracking, class schedules, exam countdowns, GPA calculation, and a built-in Pomodoro focus timer into an offline-first single mobile companion without SaaS bloat or corporate complexity.

## Operating Context

- Mobile handheld usage throughout campus (lecture halls, libraries, dorm rooms, transit).
- Fast glanceability between classes (checking room numbers, next lecture time, and task deadlines).
- Focused solo study sessions utilizing the Pomodoro timer.
- Semester milestone check-ins (midterm/final exam schedules, GPA tracking).

## Capabilities and Constraints

- Capabilities:
  - Task management (priorities, due dates, categories, status).
  - Class schedule (jadwal kuliah with day, time, room, and lecturer).
  - Course repository (mata kuliah with SKS, notes/info).
  - Notes (catatan ringkas per matkul).
  - Grade tracking & GPA calculator (nilai semester, bobot, target IPK).
  - Exam countdowns (jadwal UTS/UAS).
  - Pomodoro focus timer (work/break intervals, session tracking).
  - Background/local reminder notifications.
  - Supabase authentication & cloud data sync with local storage fallback.
- Technical Constraints:
  - Capacitor Android container wrapping HTML/Tailwind/DaisyUI/ES module JavaScript in `www/`.
  - Must preserve existing UX workflows, bottom navigation, routing, data structures, Supabase integration, and business logic intact.
  - UI redesign must adhere to Android Material Design 3 (M3) conventions (proper touch targets, M3 color roles, tonal elevations, Android navigation bar & status bar considerations).
  - Strict anti-pattern constraints: avoid generic AI slop, avoid excessive gradients, avoid nested cards, avoid glassmorphism, avoid pure black/gray without tint, avoid gratuitous decorative cards/shadows.

## Brand Commitments

- Name: CampusMate ("Pendamping Akademik").
- Identity: Modern, clean, professional, focused, and distinctly student-oriented.
- Voice: Friendly, encouraging, and clear Indonesian ("id").
- Visual identity: Material Design 3 / Material You aligned, purposeful typography, high clarity, and calm academic focus.

## Evidence on Hand

- Existing functional web/Capacitor codebase in `www/` (`js/pages/`, `js/data/`, `js/core/`, `js/ui/`).
- App icon: `www/icon.png`.
- Manifest and configuration: `www/manifest.json`, `capacitor.config.json`.
- Android project: `android/`.

## Product Principles

1. **Student Ergonomics First**: Prioritize glanceable schedules and one-tap task completion for fast, friction-free mobile interaction on the move.
2. **Material 3 Native Affinity**: Follow Android M3 design tokens, typography scale, surface containers, and spacing rhythm rather than generic web SaaS templates.
3. **Calm Clarity over Visual Clutter**: Emphasize content readability, strong typographic hierarchy, and purposeful subtle accents over nested containers, gratuitous shadows, and distracting gradients.
4. **Preserve Integrity**: Any visual or UI refinement must preserve the underlying functionality, routes, offline resilience, and database integration completely intact.

## Accessibility & Inclusion

- Adhere to WCAG AA color contrast standards (especially on colored chips, badges, and status indicators).
- Maintain minimum 48x48dp touch targets for buttons, bottom navigation items, and interactive list elements.
- Clean typographic legibility with scalable fluid type.
