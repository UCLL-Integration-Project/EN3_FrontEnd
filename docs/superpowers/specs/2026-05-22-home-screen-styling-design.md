# Home Screen Styling Design

**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** `components/HomeScreen.tsx` — visual styling only, no logic changes

---

## What We're Building

Style the home screen navigation hub that was built in Part 1. The screen already renders correctly; this spec covers only the visual treatment.

---

## Approved Design

### Header — Brand Gradient Banner

- Full-width gradient block at the top of the screen: `linear-gradient(135deg, #2A6F30 0%, #087F8C 100%)`
- Extends into the safe-area top (uses `pt-safe-t`)
- Inside the banner, stacked:
  - Small label: time-of-day greeting ("Good morning", "Good afternoon", "Good evening") in `text-white/70`, `text-xs`, `font-medium`
  - Large name: user's first name (or username fallback) in `text-white`, `text-2xl`, `font-extrabold`, `tracking-tight`
- No avatar, no extra controls — clean and bold

### Navigation List — Vertical Cards

- `flex flex-col gap-2` list of `Link` cards
- Each card: white background, `rounded-2xl`, `shadow-card`, `ring-1 ring-ink-100`, `p-4`
- Press feedback: `active:scale-[0.98] transition-transform duration-100`
- Inside each card (left → right):
  - **Icon pill**: `w-9 h-9 rounded-xl bg-brand-50 text-brand-600` with a lucide icon (`size={20} strokeWidth={2.25}`)
  - **Label**: `flex-1 text-[15px] font-semibold text-ink-900`
  - **Chevron**: `ChevronRight size={18} text-ink-300 strokeWidth={2.5}`
- **Admin card** (visible only when `user.role === "ADMIN"`): icon pill uses `bg-secondary-50 text-secondary-600`, label uses `text-secondary-800` — visually distinct but not alarming

### Nav Items & Icons (lucide-react)

| Page | Icon | 
|---|---|
| Profile | `User` |
| Connections | `Users` |
| Device | `Cpu` |
| Stats | `BarChart2` |
| Settings | `Settings` |
| Admin | `Shield` |

### Sign Out — Bottom Pill

- Pushed to the bottom with `mt-auto`
- Full-width outlined pill: `ring-1 ring-ink-200`, `rounded-full`, `text-[13px] font-semibold text-ink-500`
- `LogOut` icon (size 15) inline left of label
- `active:bg-ink-100` press feedback
- Respects bottom safe area: `pb-safe-b` or `pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))]`

### Stagger Animation

- Each nav card gets a small CSS animation delay so they rise in sequence:
  - Use inline `style={{ animationDelay: `${index * 40}ms` }}` with `animate-rise`
  - Keeps total entrance under 300ms (5 items × 40ms = 200ms for last card)

---

## What Does Not Change

- The auth-routing logic in `page.tsx`
- All other pages — back buttons, guards, routes
- Locale strings (already added in Part 1)
- The `TitleScreen` landing page

---

## Files Touched

- `components/HomeScreen.tsx` — styling rewrite only

---

## Non-Goals

- No new backend calls
- No state changes
- No changes to other pages
