# Mobile Responsiveness — What's Changing

**Date:** 2026-02-26
**Scope:** Full-app mobile support (375px–768px), no new dependencies

---

## Why

The app was ~60% responsive. Landing, auth, and canvas list pages already worked on mobile. But the core workflows — canvas editor, task board, document editor, and side panels — were desktop-only with hardcoded widths and no mobile adaptations. This work makes the entire app usable on phones.

## Design Principles

1. **Touch-first on mobile.** Every tappable element is at least 40px (most are 44px). Spacing between interactive elements is adequate to prevent mis-taps.
2. **Show less, not smaller.** Instead of cramming the desktop UI into a phone screen, we hide secondary actions behind overflow menus and show only the essential tools.
3. **Panels go full-width.** Any slide-out panel (settings, AI agent, workflow) takes the full screen on mobile with a backdrop overlay for dismissal. On desktop, nothing changes.
4. **Scroll, don't wrap.** The doc editor toolbar scrolls horizontally on mobile instead of wrapping into 3+ rows. The task board columns snap-scroll one at a time.
5. **No new dependencies.** Uses existing `useIsMobile()` hook, Tailwind responsive prefixes (`md:`, `sm:`), and the shadcn Sheet that the sidebar already uses.

---

## What Changed (by area)

### Dashboard Shell

**Files:** `site-header.tsx`, `app-sidebar.tsx`

| Before | After |
|--------|-------|
| Sidebar hamburger was 28px | 40px on mobile, 28px on desktop |
| Theme switcher always visible | Hidden on mobile (still in sidebar) |
| Nav items had 8px vertical padding | 12px on mobile for thumb-friendly tapping |

The shadcn `Sidebar` component already renders as a Sheet (full-screen drawer) on mobile via `useIsMobile()`. We didn't need to change that — just polished touch targets.

### Canvas Floating Toolbar (largest change)

**File:** `CanvasFloatingToolbar.tsx`

| Before | After |
|--------|-------|
| One toolbar layout for all screens | Desktop: unchanged. Mobile: `[Menu] [Name] [+Add] [Save] [...More]` |
| 15+ buttons always visible | Mobile shows 3 primary actions; rest in overflow dropdown |
| Slide-out menu was fixed 256px | Responsive: `calc(100vw - 3rem)` on mobile, 256px on desktop |
| Toolbar at top-16px | top-8px on mobile for less dead space |

**Why `useIsMobile()` instead of pure Tailwind here:** The mobile and desktop toolbars render completely different JSX trees (different button order, different groupings, a DropdownMenu vs inline buttons). Tailwind can only toggle styles, not structure. The hook is the right tool for this case.

### Canvas Side Panels

**Files:** `NodeSettingsPanel`, `CanvasAgentPanel`, `WorkflowTrackerPanel`, `DocAgentPanel`

All panels: `w-[fixed]` → `w-full md:w-[fixed]`

| Panel | Desktop Width | Mobile Width |
|-------|--------------|--------------|
| Node Settings | 360px | full screen |
| AI Agent (Merlin) | 400px | full screen |
| Workflow Tracker | 320px | full screen |
| Doc Agent | 400px | full screen |

All close buttons are now 40px on mobile. WorkflowTrackerPanel gained a backdrop overlay on mobile (`md:hidden`) so users can tap outside to dismiss.

### Document Editor

**File:** `DocEditor.tsx`

| Before | After |
|--------|-------|
| Toolbar wraps to 3-4 rows on mobile | Horizontally scrollable single row on mobile, wraps on desktop |
| Agent panel pushes content with `mr-[400px]` | Only pushes on desktop (`md:mr-[400px]`); overlays on mobile |
| Header stacked into two rows on mobile | Single row always — title flexes, buttons shrink |
| `prose-lg` at all sizes | `prose-sm` on mobile, `prose-lg` on desktop |
| All toolbar buttons 32px | 40px on mobile, 32px on desktop |

### Task Board

**Files:** `tasks/page.tsx`, `TaskBoard.tsx`, `TaskColumn.tsx`

| Before | After |
|--------|-------|
| Page header was one row with all controls | Stacks vertically on mobile, filter goes full-width |
| Columns were fixed 288px on all screens | 75vw on mobile (~281px on iPhone, shows peek of next column), 288px on tablet+ |
| No scroll snapping | `snap-x snap-mandatory` on mobile — columns snap into view one at a time |
| Max height used `100vh` | Uses `100dvh` on mobile (accounts for browser chrome sliding) |

### Other Dashboard Pages

- `settings/ai`, `settings/api-tokens`: `p-8` → `p-4 md:p-8`
- `api-tokens`: Canvas checkbox grid `grid-cols-2` → `grid-cols-1 md:grid-cols-2`
- `metrics`: Summary stats grid `gap-4` → `gap-2 md:gap-4`
- `canvas` list: Stats grid `gap-4` → `gap-2 md:gap-4`

### Canvas Container

**File:** `Canvas.tsx`

Added `touch-none` class to prevent the browser from hijacking touch gestures (pinch-to-zoom, pull-to-refresh) on the canvas surface. The canvas has its own pan/zoom handling.

### Global CSS

**File:** `globals.css`

Added `.scrollbar-none` utility (hides scrollbar while preserving scroll behavior). Used on the doc editor toolbar for clean horizontal scrolling on mobile.

---

## What Didn't Change

- **No new npm packages.** Everything uses existing Tailwind + shadcn.
- **No backend changes.** This is purely frontend CSS/layout.
- **Desktop experience is identical.** All changes are gated behind responsive breakpoints or `useIsMobile()`.
- **No changes to business logic, API calls, or state management.**
- **Auth pages, landing page, canvas list page** — already responsive, untouched.

---

## How to Test

### Quick smoke test (browser)

1. Open Chrome DevTools → Toggle Device Toolbar
2. Select "iPhone 14" (390px) or "iPhone SE" (375px)
3. Walk through:
   - **Dashboard:** Hamburger opens sidebar drawer. Navigation works. Drawer dismisses on overlay tap.
   - **Canvas editor:** Toolbar shows `[Menu] [Name] [+Add] [Save] [...]`. Tap "..." to access all tools. Tap "+" to add nodes.
   - **Canvas panels:** Open any panel (AI, Workflow, Settings). Should be full-width. Tap backdrop or X to close.
   - **Task board:** Columns snap-scroll horizontally. Cards are tappable. "Add a card" works.
   - **Doc editor:** Toolbar scrolls horizontally. AI button shows just sparkle icon. "Done" button is reachable.

### Real device test

Access via Tailscale: `http://100.94.42.92:3000`

Test on actual phones for:
- Touch target feel (are buttons easy to tap without mis-taps?)
- Scroll momentum on task board columns
- Canvas pan/zoom with fingers (should work without triggering browser gestures)
- Keyboard behavior when typing in task creation / doc editor

### What to watch for

- **No horizontal overflow** on any page (nothing should cause a horizontal scrollbar at 375px)
- **Panels dismiss properly** on mobile (overlay tap or X button)
- **Text truncation** looks clean (ellipsis, not cut off mid-character)
- **Toolbar scroll** on doc editor feels native (no visible scrollbar, smooth momentum)
