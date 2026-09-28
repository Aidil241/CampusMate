---
name: CampusMate
description: Android-first personal academic companion with Material Design 3 precision and calm focus
colors:
  primary: "#4F46E5"
  primary-container: "#EEF2FF"
  on-primary: "#FFFFFF"
  on-primary-container: "#312E81"
  surface: "#FFFFFF"
  surface-container: "#F8FAFC"
  surface-container-high: "#F1F5F9"
  on-surface: "#0F172A"
  on-surface-variant: "#475569"
  outline: "#E2E8F0"
  outline-variant: "#CBD5E1"
  warning: "#D97706"
  warning-container: "#FEF3C7"
  success: "#059669"
  success-container: "#D1FAE5"
  error: "#DC2626"
  error-container: "#FEE2E2"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#4338CA"
  button-tonal:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Design System: CampusMate

## Overview

**Creative North Star: "The Focused Scholar"**

CampusMate is built around the ethos of calm academic precision. Rather than resembling a cluttered commercial project management tool or an over-decorated web showcase, the interface acts as a quiet, disciplined pocket companion. It balances high glanceability during brief corridor transitions between lectures with comfortable, distraction-free legibility during extended solo Pomodoro study blocks.

The aesthetic follows Android Material Design 3 (M3) and Material You principles: structured tonal surface containers replace heavy artificial shadows; purposeful, tinted color roles convey state without visual noise; and a strict 48×48dp ergonomic touch floor ensures confident handheld operation on mobile devices.

**Key Characteristics:**
- **Zero Decorative Noise:** Eliminates nested card enclosures, glassmorphic blurs, gratuitous gradients, and arbitrary drop shadows.
- **Tonal Hierarchy:** Depth is created through surface container tones (`surface`, `surface-container`, `surface-container-high`) rather than floating drop shadows.
- **Academic Glanceability:** Key academic metrics (today's next class, impending assignment deadlines, current IPK, and Pomodoro timer) are prominent at a single glance.
- **Ergonomic Touch Targets:** Strict 48×48dp minimum touch bounding boxes with at least 8dp separation across all interactive controls.

## Colors

The color system adapts Material Design 3 roles centered around Deep Academic Indigo, paired with high-contrast tinted neutrals and strict semantic accents.

### Primary
- **Deep Academic Indigo** (#4F46E5): Key brand anchor used for primary actions, active navigation indicators, and the prominent FAB.
- **Indigo Container** (#EEF2FF): Tinted tonal fill for active state badges and selected filter chips.
- **On Primary** (#FFFFFF): High-contrast text and glyphs placed on top of primary buttons and badges.

### Neutral
- **Surface Canvas** (#FFFFFF): Crisp, clean backdrop for primary screen content in light mode.
- **Surface Container** (#F8FAFC): Subtle low-tonal fill used for screen framing and secondary card backdrops.
- **Surface Container High** (#F1F5F9): Distinct tonal fill for input fields, filter bars, and inactive pills.
- **On Surface** (#0F172A): Deep slate text color (avoiding pure #000000) ensuring high legibility and soft contrast.
- **On Surface Variant** (#475569): Secondary text for metadata, subtitles, timestamps, and lecturer names.
- **Outline** (#E2E8F0): Hairline divider and border tone (1px) used sparingly for visual separation.

### Semantic Accents
- **Academic Warning (Amber)** (#D97706): Reserved for GPA/IPK badges and impending deadline alerts.
- **Academic Success (Emerald)** (#059669): Reserved for completed tasks and active course status.
- **Academic Urgency (Red)** (#DC2626): Reserved for overdue assignments and exam alerts.

### Named Rules
**The Rarity Rule.** Primary accent (#4F46E5) occupies no more than 10% of any screen surface. When everything screams for attention, nothing gets done.

**The No Pure Black Rule.** Text and surfaces never use uncalibrated pure `#000000` or `#808080`. All dark tones are subtly tinted with slate or indigo to preserve natural material depth.

## Typography

**Display Font:** Plus Jakarta Sans (with system-ui, sans-serif fallback)  
**Body Font:** Inter (with Roboto, sans-serif fallback)  
**Label Font:** Inter (with Roboto, sans-serif fallback)  

**Character:** A pairing of confident, geometric structural headings (Plus Jakarta Sans) with ultra-legible, rhythmically disciplined text (Inter) calibrated for mobile screen reading.

### Hierarchy
- **Display** (Bold 700, 1.75rem / 28px, line-height 1.2): Reserved for milestone numbers (e.g. large Pomodoro countdown, IPK score summary).
- **Headline** (Bold 700, 1.25rem / 20px, line-height 1.3): Used for main page headers and section titles.
- **Title** (SemiBold 600, 1.0rem / 16px, line-height 1.4): Used for task titles, course card names, and modal sheet headers.
- **Body** (Regular 400 & Medium 500, 0.875rem / 14px, line-height 1.5): Standard reading text for descriptions, notes, and form inputs.
- **Label** (SemiBold 600, 0.75rem / 12px, line-height 1.3, letter-spacing 0.02em): Used for filter chips, status badges, timestamps, and bottom navigation labels.

### Named Rules
**The Two-Family Boundary Rule.** Plus Jakarta Sans is strictly confined to headlines, screen titles, and prominent counters; all dense lists, input fields, labels, and body copy strictly use Inter.

## Layout

CampusMate is designed for single-hand mobile ergonomics within a 480px maximum width container.

- **Vertical Rhythm:** 16px page padding (`p-4`), 12px gap between list items, 8px gap between inline metadata chips.
- **Safe Area Insets:** Fixed top bar and bottom navigation respect mobile hardware insets (status bar cutout and Android system gesture bar).
- **Navigation Bar:** Fixed compact bottom navigation bar (56px–64px height) hosting 4 primary destinations (Home, Tugas, Jadwal, Lainnya) with 48×48dp tap targets.
- **Bottom Sheet Drawer:** Used for secondary feature navigation ("Lainnya") and entity creation forms, sliding up smoothly on mobile viewports.

## Elevation & Depth

CampusMate utilizes **Material 3 Tonal Elevation** rather than artificial drop shadows.

- **Resting State:** Surfaces and cards rest flat against the background (`box-shadow: none`) separated by tonal surface values (`surface-container` against `surface`) or a subtle 1px outline (`#E2E8F0`).
- **Elevated Interactive Controls:** Floating Action Button (FAB) uses subtle ambient M3 elevation (`0 4px 8px rgba(0,0,0,0.12)`) to indicate tactile float.
- **Modal Sheets:** Bottom dialogs use ambient elevation (`0 -4px 16px rgba(0,0,0,0.1)`) accompanied by a 40% dark backdrop veil.

### Named Rules
**The Zero Arbitrary Shadow Rule.** Standard cards, task rows, and schedule items must never carry arbitrary heavy CSS drop shadows (e.g., `shadow-xl`, `shadow-2xl`). Depth is expressed strictly through background tonal contrast and hairline borders.

## Shapes

- **Form Language:** Rounded, friendly, and tactile without drifting into cartoonish proportions.
- **Card Containers:** 16px radius (`rounded-2xl` / `16px`) for primary cards and schedule blocks.
- **Interactive Buttons & Chips:** Full pill radius (`rounded-full` / `9999px`) for action chips, filter pills, and primary action buttons.
- **Floating Action Button (FAB):** 56×56px circle (`rounded-full`) with centered icon.
- **Dialogs & Bottom Sheets:** 24px top radius (`rounded-t-3xl` / `24px`) on mobile bottom sheets.

## Components

### Buttons
- **Shape:** Full pill shape (`rounded-full`).
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, padding `10px 20px`, font weight 600. Active tap triggers a 0.98 scale micro-compression.
- **Tonal / Neutral:** Background `#F1F5F9`, text `#4F46E5`, border none, padding `10px 20px`.
- **Icon / Ghost Buttons:** 48×48dp circular bounding box, background transparent, hover `#F1F5F9`.

### Chips & Filter Pills
- **Style:** Compact pill (`rounded-full`), height 32px, padding `4px 12px`.
- **Selected State:** Background `#EEF2FF`, border `1px solid #4F46E5`, text `#4F46E5`, font weight 600.
- **Unselected State:** Background `#F1F5F9`, border `1px solid transparent`, text `#475569`, font weight 500.

### Task & Schedule Cards
- **Corner Style:** 16px radius (`rounded-2xl`).
- **Background:** `#FFFFFF` on `#F8FAFC` canvas.
- **Border:** 1px hairline border `#E2E8F0`.
- **Internal Padding:** 14px–16px.
- **Touch Target:** Entire card row is clickable for editing or expanding, with a dedicated 48×48dp touch region for the completion checkbox.

### Floating Action Button (FAB)
- **Shape:** Circle 56×56dp (`rounded-full`).
- **Placement:** Bottom-right anchored (16px right, 80px bottom to clear the bottom nav bar).
- **Background:** `#4F46E5`, text/icon `#FFFFFF`.
- **Behavior:** Houses the single primary action of the active page (e.g. Tambah Tugas, Tambah Jadwal).

### Navigation Bar
- **Style:** Bottom-anchored 64px height bar, background `#FFFFFF` with top 1px border `#E2E8F0`.
- **Items:** 4 evenly distributed destinations with minimum 48×48dp tap areas. Active item features an indicator pill and `#4F46E5` icon.

## Do's and Don'ts

### Do:
- **Do** preserve minimum 48×48dp tap targets on all touchable elements.
- **Do** convey elevation using M3 tonal contrast (`surface-container-high`) rather than floating drop shadows.
- **Do** maintain high contrast between text labels and their background chips (WCAG AA compliant).
- **Do** keep cards flat at rest with a clean 1px hairline border (`#E2E8F0`).
- **Do** use Indonesian ("id") microcopy consistently across all action labels and empty states.

### Don't:
- **Don't** use multi-stop purple-to-blue gradients or glassmorphism blurs on cards.
- **Don't** nest cards inside other cards (e.g. a task card inside an outer card inside a section card).
- **Don't** use uncalibrated pure black (`#000000`) for text or backgrounds.
- **Don't** shrink touch targets below 48dp to squeeze more buttons onto the screen.
- **Don't** alter the Supabase database schema, authentication lifecycle, or route state logic when refining UI components.
- **Don't** use native browser/system dialogs (`<select>`, `<input type="datetime-local">`, `alert()`, `confirm()`); use the shared M3 pickers.

## Global CampusMate M3 Overlay & Picker Standard

All form sheets, pickers, and modal overlays must strictly adhere to the unified standard documented in [`COMPONENTS.md`](COMPONENTS.md) and implemented in [`www/js/ui/picker.js`](www/js/ui/picker.js):
- **Course Selection:** Use `renderCourseTrigger` and `openCoursePicker`. Never use native HTML `<select>`.
- **Date & Time Selection:** Use `renderDateTimeTrigger` and `openDateTimePicker`. Never use native `<input type="datetime-local">`. Preserves `YYYY-MM-DDTHH:mm` serialization contract.
- **Option Selection:** Use `openSelectionSubSheet` with M3 tonal cards and checkmark indicators.
- **Delete Confirmation:** Use `openDeleteConfirmation` with in-sheet state preservation. Tapping "Batal" must never wipe user form edits.
- **Shell Navigation Purity:** Exactly one `#bottomnav` and one `#topbar` provided by the application shell. Pages must never render competing duplicate page headers or local bottom navigations.

