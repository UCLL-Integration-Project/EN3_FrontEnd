# EN3_FrontEnd — CLAUDE.md

Frontend for the EN3 IT Integration project (UCLL, 2025/2026). Talks to the **EN3_BackEnd** API. The product is a **mobile app built with a web framework** — design and build mobile-first.

> ⚠️ The actual code currently lives on the **`Feat-Init`** branch. `main` is just a README; `productionSetup` holds CI/CD workflows. Check out `Feat-Init` before working.

## Stack
- **Next.js (App Router) + TypeScript** — routes under `app/[locale]/...` (locale segment in the URL)
- **i18n** via `next-intl` (`i18n.ts`)
- **Tailwind CSS** (`postcss.config.mjs`); UI helpers from `@headlessui/react`, theming via `next-themes`
- Data fetching with **SWR**; **web-push** is a dependency (push notifications planned)
- Auth state in a **React context** (`context/AuthContext.tsx`, `hooks/useAuth.tsx`)
- Tests: **Jest** (`jest.config.js`) for units; **Cypress + Cucumber** (`cypress/`, `.feature` files) for e2e
- ESLint (`eslint.config.mjs`); **Docker** (`Dockerfile`, standalone build → `node server.js`); CI/CD in `.github/workflows/`

## Layout
- `app/[locale]/` — pages: `page.tsx`, `login/`, `signup/`, `layout.tsx`, `head.tsx`
- `components/` — shared UI (`header.tsx`, `users/UserLoginForm`, `users/UserSignupForm`, `language/`)
- `context/`, `hooks/` — auth state and other hooks
- `cypress/` — e2e features + step definitions

## Running (`package.json` scripts)
- `npm install`
- `npm run dev` — Next dev server on **port 8080**
- `npm run build` && `npm start` — production (standalone server)
- `npm test` — Jest
- `npm run cypress:open` / `npm run cypress:run` — e2e
- The backend base URL must come from **env config**, never hardcoded. Heads-up: a browser preview, an emulator, and a physical device each need a different host to reach a locally-running backend.

## Conventions
- Branch off the working branch and open PRs. The task board is in **OpenProject** (see the EN3_Obsidian vault), not in this repo.
- New page → folder under `app/[locale]/`; shared UI → `components/`
- Mobile-first; follow the team style guide once it exists (there's a planned work package for it)

## Cleanup / notes
- Several `cypress/e2e/features/*.feature` files (forum / lecturer overview / schedules-enroll-students) look inherited from a course template — replace them with features for what we actually build
- Decide early whether this stays a web/PWA app or gets wrapped as a native build — it changes the device/e2e story
