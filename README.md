# CrossWave — EN3 Frontend

The CrossWave mobile app. Frontend for the EN3 IT Integration project (UCLL, 2025/2026), paired with the **EN3_BackEnd** API.

> **This is an app, not a website.** Every screen is designed and built for a phone-sized, touch-driven, full-screen experience. It happens to run on Next.js in a browser — that's an implementation detail. See [`CLAUDE.md`](./CLAUDE.md) for the design rules every contributor must follow.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS** (v3) — design tokens in `tailwind.config.js`, primitives in `styles/globals.css`
- **next-intl** for i18n (English + Dutch under `public/locales/`)
- **next-themes**, **@headlessui/react**, **SWR**, **web-push**
- **Jest** unit tests, **Cypress + Cucumber** e2e
- **Docker** standalone build, CI/CD in `.github/workflows/`

## Quick start

```bash
# 1. Install
npm install

# 2. Configure the backend URL
cp .env.example .env.local   # or create it manually — see "Environment" below

# 3. Run the dev server (port 8080)
npm run dev
```

Open <http://localhost:8080>. On desktop the app renders inside a **440px phone-shaped frame**; resize / DevTools-toggle to mobile to see it fill the device.

### All scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Next.js dev server on port **8080** |
| `npm run build` | Production build (standalone output) |
| `npm start` | Run the production build (`node server.js`) |
| `npm test` | Jest unit tests |
| `npm run cypress:open` | Open Cypress runner |
| `npm run cypress:run` | Headless Cypress |
| `npm run lint` | ESLint |

## Environment

The frontend reads the backend base URL from `NEXT_PUBLIC_API_URL`. **Never hard-code the backend URL.**

`.env.local` (gitignored):

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Heads up: a browser preview, an emulator, and a physical device each need a different host to reach a locally-running backend. Pick the value that matches where you're testing.

## Project layout

```
app/[locale]/        # routes (locale segment in the URL)
  layout.tsx         # html shell + AppFrame + AppBar + main
  page.tsx           # landing screen
  login/page.tsx
  signup/page.tsx
components/          # UI — re-use the design primitives in globals.css
  header.tsx         # the app bar (not a website navbar)
  TitleScreen.tsx    # landing screen content
  language/          # locale switcher
  users/             # login / signup / button widgets
context/             # AuthContext (React context for auth state)
hooks/               # useAuth and other hooks
services/            # API calls (UserService.ts)
public/locales/      # next-intl message files (en, nl)
styles/globals.css   # design system primitives (.app-frame, .app-bar, .btn, .field*, etc.)
tailwind.config.js   # theme tokens (brand colors, safe-area, radii, animations)
cypress/             # e2e features + step definitions
```

## Design system — at a glance

The app-shell, components and utilities are defined in [`styles/globals.css`](./styles/globals.css) and [`tailwind.config.js`](./tailwind.config.js). Use these instead of ad-hoc classes:

- **Shell**: `.app-frame`, `.app-bar`, `.app-main`, `.app-screen`
- **Buttons**: `.btn`, `.btn-cta`, `.btn-ghost`, `.icon-btn`, `.nav-pill`
- **Containers**: `.card`, `.sheet`
- **Forms**: `.field`, `.field-label`, `.field-control`, `.field-input`, `.field-error`
- **Status**: `.status`, `.status-success`, `.status-error`
- **Brand**: `bg-brand-gradient`, `text-brand-*`, `.brand-mark`
- **Safe areas**: `pt-safe-t`, `pb-safe-b`, `pl-safe-l`, `pr-safe-r`

Full app-first rules (touch targets, navigation pattern, motion budget, etc.): see [`CLAUDE.md`](./CLAUDE.md).

## Branching

Active development happens on **`dev`**. `main` holds this README; `productionSetup` holds CI/CD workflows. Branch off `dev`, open PRs into `dev`. The task board is in **OpenProject** (see the EN3_Obsidian vault), not in this repo's issues.

## Open question

PWA or wrapped native build? The design system supports either path; pick before the first store submission since it changes the e2e/device story.
