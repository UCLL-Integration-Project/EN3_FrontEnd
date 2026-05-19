# EN3_FrontEnd — CLAUDE.md

Frontend for the EN3 IT Integration project (UCLL, 2025/2026). Codename **CrossWave**. Talks to the **EN3_BackEnd** API.

> **This is an app, not a website.**
> Every screen, component, and interaction must be designed and built for a phone-sized, touch-driven, full-screen experience. The fact that it currently runs in a browser via Next.js is an implementation detail — the product is a mobile app.

Active development happens on the `dev` branch (`main` holds the README; `productionSetup` holds CI/CD workflows). Branch off `dev` and open PRs into `dev`.

## Stack
- **Next.js (App Router) + TypeScript** — routes under `app/[locale]/...` (locale segment in the URL)
- **i18n** via `next-intl` (`i18n.ts`, messages in `public/locales/{en,nl}/common.json`)
- **Tailwind CSS** (v3) — design tokens and primitives in `tailwind.config.js` + `styles/globals.css`
- UI helpers from `@headlessui/react`, theming via `next-themes`
- Data fetching with **SWR**; **web-push** dependency reserved for push notifications
- Auth state in a **React context** (`context/AuthContext.tsx`, `hooks/useAuth.tsx`)
- Tests: **Jest** (`jest.config.js`) for units; **Cypress + Cucumber** (`cypress/`) for e2e
- ESLint (`eslint.config.mjs`); **Docker** (`Dockerfile`, standalone build → `node server.js`); CI/CD in `.github/workflows/`

## Layout
- `app/[locale]/` — pages: `page.tsx`, `login/`, `signup/`, `layout.tsx`
- `components/` — shared UI (`header.tsx` is the **app bar**, `TitleScreen.tsx` is the landing **screen**, `users/`, `language/`)
- `context/`, `hooks/` — auth state and other hooks
- `services/` — API calls (`UserService.ts`)
- `styles/globals.css` — design system primitives (`.app-frame`, `.app-bar`, `.app-screen`, `.card`, `.sheet`, `.btn`, `.btn-cta`, `.btn-ghost`, `.icon-btn`, `.nav-pill`, `.field*`, `.status*`)
- `cypress/` — e2e features + step definitions

## Running (`package.json` scripts)
- `npm install`
- `npm run dev` — Next dev server on **port 8080**
- `npm run build` && `npm start` — production (standalone server)
- `npm test` — Jest
- `npm run cypress:open` / `npm run cypress:run` — e2e
- The backend base URL must come from **env config**, never hardcoded. A browser preview, an emulator, and a physical device each need a different host to reach a locally-running backend.

---

## App-first design rules (READ BEFORE ADDING UI)

When designing or building any screen, follow these rules. If you're tempted to break one, you're probably treating it as a website.

### 1. Phone-shaped viewport, always
- Every screen renders inside the `.app-frame` shell (max **440px** wide). On desktop it stays a phone-shaped frame; on a phone it fills the device.
- Use `h-dvh` / `100svh`, never `100vh`. The viewport changes height when the URL bar shows/hides.
- Account for safe areas with the `pt-safe-t` / `pb-safe-b` utilities (notch, home indicator). The shell already does this — anything you place at the very top or very bottom must respect it.

### 2. Touch first, no hover
- Minimum hit target: **44×44px** (`.tap`, `.icon-btn`, `.btn` already enforce this).
- Don't design interactions that depend on `:hover` to be discoverable — phones don't hover. Hover styles are decoration, not affordance.
- Use `active:` states for press feedback. Add subtle `active:scale-[0.98]` for primary actions.

### 3. One screen, one purpose
- Each route is a full-screen view (`.app-screen`). No sidebars. No two-column desktop layouts.
- Primary action lives **near the bottom** (thumb reach), not at the top.
- Long forms scroll inside the screen; the sticky CTA can pin to the bottom safe area.

### 4. Navigation is app-style, not web-style
- The top bar is an **app bar** (`.app-bar`) — brand left, contextual actions right. It is **not** a website navbar with menu links.
- For multi-section apps, prefer a **bottom tab bar** over a header nav menu.
- Back navigation: use a leading back-button icon on subpages, not browser-back affordances.

### 5. Inputs feel native
- All inputs are min 16px font-size (prevents iOS zoom-on-focus). The `.field-input` primitive handles this.
- Always set `inputMode`, `autoComplete`, `autoCapitalize`, and `autoCorrect` to match the field semantics.
- Show/hide password toggles, numeric keypads for numeric fields, email keyboards for email — small details matter.

### 6. Type & spacing
- Use the typography primitives (`h1`–`h6`, `p`) defined in `globals.css`. They are tuned for small screens — don't override with arbitrary `text-*xl` classes "to make it look like a website".
- Generous vertical rhythm; tight horizontal padding (5–6 / `px-5`).

### 7. Brand & color
- Brand is the **CrossWave** aqua gradient (`bg-brand-gradient`, `text-brand-*`). Use it for primary surfaces, accents, and CTAs.
- Body copy uses the `ink-*` neutrals. Avoid raw Tailwind grays — they look generic.
- Status colors: success = emerald, error = red, both via the `.status*` primitives.

### 8. Motion
- Use the built-in `animate-rise` (screen mount), `animate-sheet-in` (cards/menus), and `animate-wave` (decorative). Keep durations under 300ms.
- Never use long-running entrance animations on every interaction — apps feel snappy, not theatrical.

### 9. No web-only chrome
- No browser-style scrollbars on the shell (`.no-scrollbar`).
- Disable text-selection on UI chrome (the base layer does this); keep it on for content the user can copy (messages, IDs).
- No multi-tab-style tab strips, no breadcrumbs, no footer with "© Company". This is an app.

### 10. Build & test the app shape
- When you `npm run dev`, the app renders in the phone frame even on desktop. **If your change only looks right at 1440px wide, you've built a website by accident.**
- For real device testing, use Chrome DevTools device emulation OR a phone on the same Wi-Fi pointing to your dev host.

## Conventions
- Branch off `dev` and open PRs back into `dev`. The task board is in **OpenProject** (see the EN3_Obsidian vault), not in this repo.
- New screen → folder under `app/[locale]/` with a `page.tsx` that renders a single `<section className="app-screen">` (or a screen component from `components/`).
- Shared UI → `components/`. Re-use the design primitives in `globals.css` before inventing new classes.
- New locale strings go in **both** `public/locales/en/common.json` and `public/locales/nl/common.json`. Don't ship English-only text.

## Cleanup / notes
- Several `cypress/e2e/features/*.feature` files (forum / lecturer overview / schedules-enroll-students) look inherited from a course template — replace them with features for what we actually build.
- Open question: stay a web/PWA app, or wrap with Capacitor/Tauri/native shell. Either path is supported by the current design system; decide before the first store submission since it changes the e2e/device story.
