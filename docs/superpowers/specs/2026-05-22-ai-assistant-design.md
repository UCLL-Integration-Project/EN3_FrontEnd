# AI Assistant Design

**Date:** 2026-05-22
**Status:** Approved
**Scope:** Frontend implementation of the CrossWave AI Assistant feature

---

## Overview

Add an AI assistant to CrossWave that does two things:
1. **On-demand Q&A** — user navigates to a dedicated AI page, asks a question, gets a one-shot answer
2. **Proactive insights** — on home screen load (with a 4-hour cooldown), a popup surfaces a personalised insight based on the user's opted-in data

---

## Architecture

### Backend API (separate team — see backend prompt below)

Two new endpoints:

**`POST /api/v1/ai/chat`**
- Request: `{ question: string, context: UserAIContext }`
- Response: `{ answer: string }`
- Auth: required (httpOnly session cookie)
- Behaviour: single-turn, stateless — no conversation history

**`GET /api/v1/ai/insight`**
- Response: `{ insight: string | null }` — `null` if cooldown active or insufficient data
- Auth: required (httpOnly session cookie)
- Behaviour: backend uses authenticated user's data to generate one short personalised insight (1–2 sentences). Returns `null` rather than a low-quality insight.

### Frontend

```
components/
  ai/
    AiChat.tsx          — full-page Q&A UI (question input + answer display)
    AiInsightPopup.tsx  — bottom sheet proactive insight with dismiss + ask-more
hooks/
  useAIContext.ts       — reads localStorage toggles, fetches allowed data, returns UserAIContext
services/
  AiService.ts          — chatRequest(), insightRequest()
app/[locale]/
  ai/
    page.tsx            — AuthGuard + AiChat
```

Existing files modified:
- `components/HomeScreen.tsx` — add FAB + insight popup trigger
- `components/users/UserSettingsForm.tsx` — add AI data access card
- `public/locales/en/common.json` — add `ai.*` keys
- `public/locales/nl/common.json` — add `ai.*` keys

### TypeScript types (add to `types/index.ts`)

```ts
export type UserAIContext = {
  profile?: { name: string; bio: string; age: number };
  stats?: { connections: number; timeActive: number; dataShared: number };
  connections?: { username: string }[];
};
```

---

## Feature 1: AI Page (`/ai`)

### Entry point
- FAB on `HomeScreen` (56×56px circle, `bg-brand-gradient`, `shadow-pop`, `active:scale-95`)
- Positioned absolute bottom-right, above the sign-out area
- Icon: `✦` text (replace with logo asset once available)
- Navigates to `/${locale}/ai`

### Page layout
- `AuthGuard` wraps the page
- App bar: `BackButton` (→ home) + title "CrossWave AI"
- Scrollable content area: answer display (empty/placeholder on first load)
- Sticky bottom: text input + send button

### Interaction
1. Page loads → placeholder text: "Ask me anything about your data…"
2. User types question → Send button enables
3. Send tapped:
   - Input disabled, loading indicator shown
   - `chatRequest(question, context)` called with context from `useAIContext`
   - On success: answer replaces placeholder, input re-enables and clears
   - On error: `status-error` banner shown, input re-enables
4. User can ask again — new answer replaces old (no history, no scroll accumulation)

### Error states
- Empty question → Send button disabled (no API call)
- Network error → `status-error`: "Couldn't reach the server. Try again."
- Unknown error → `status-error`: "Something went wrong. Try again."

---

## Feature 2: Proactive Insight Popup

### Trigger logic (in `HomeScreen`)
1. On mount, read `cw_last_insight` from `safeStorage`
2. If timestamp is absent or older than 4 hours → call `insightRequest()`
3. If response `insight !== null` → show `AiInsightPopup`
4. On dismiss or "Ask me more" → write `Date.now()` to `cw_last_insight`, close popup
5. If API call fails → silently do nothing, do not write cooldown timestamp

### `AiInsightPopup` component
- Bottom sheet (`sheet-bottom` + `sheet-grabber`) sliding up via `animate-sheet-up`
- `sheet-backdrop` behind it
- Content:
  - Eyebrow label: "✦ Daily insight" (`text-brand-600`, small caps)
  - Insight text: plain paragraph
  - "Ask me more →" button (`.btn-ghost`) → navigates to `/${locale}/ai`
  - Dismiss "×" icon button (top-right, `.icon-btn`)
- Accessibility: `role="dialog"`, `aria-modal="true"`, focus trapped while open

---

## Feature 3: AI Data Toggles (Settings)

### New card in `UserSettingsForm`
Inserted below the existing change-password section, above logout.

**Card title:** `t("ai.settings.title")` — "AI data access"

**Three toggles** (`.field-row` pattern — checkbox + label + hint):

| `localStorage` key | Label key | Hint key | Data shared |
|---|---|---|---|
| `cw_ai_share_profile` | `ai.settings.profile.label` | `ai.settings.profile.hint` | name, bio, age |
| `cw_ai_share_stats` | `ai.settings.stats.label` | `ai.settings.stats.hint` | connections, timeActive, dataShared |
| `cw_ai_share_connections` | `ai.settings.connections.label` | `ai.settings.connections.hint` | connection usernames |

**Defaults:** all `false` — user must explicitly opt in.

Storage via existing `safeStorage` helper (`context/safeStorage.ts`).

---

## `useAIContext` Hook

Reads the three localStorage flags, fetches only the data the user has enabled, and returns a `UserAIContext` object.

```ts
// hooks/useAIContext.ts
export function useAIContext(): UserAIContext {
  // reads cw_ai_share_profile / _stats / _connections from safeStorage
  // fetches getMyProfileRequest() if profile enabled
  // fetches getStatsRequest() if stats enabled
  // fetches getConnectionsRequest() if connections enabled
  // returns assembled UserAIContext (omits keys for disabled toggles)
}
```

Called on mount in both `AiChat` and `HomeScreen` (for the insight call).

---

## `AiService.ts`

```ts
// services/AiService.ts
export const chatRequest = async (
  question: string,
  context: UserAIContext,
): Promise<{ answer: string }> => { ... }

export const insightRequest = async (): Promise<{ insight: string | null }> => { ... }
```

Same error handling pattern as `AdminService.ts` — `handleResponse` parses error codes, network errors throw `"NETWORK_ERROR"`.

---

## i18n Keys

Add under `ai.*` in both `en/common.json` and `nl/common.json`:

```json
"ai": {
  "title": "CrossWave AI",
  "placeholder": "Ask me anything about your data…",
  "send": "Ask",
  "loading": "Thinking…",
  "error": {
    "NETWORK_ERROR": "Couldn't reach the server. Try again.",
    "UNKNOWN_ERROR": "Something went wrong. Try again."
  },
  "insight": {
    "eyebrow": "Daily insight",
    "askMore": "Ask me more →",
    "dismiss": "Dismiss"
  },
  "settings": {
    "title": "AI data access",
    "profile": {
      "label": "Profile & bio",
      "hint": "Your name, bio and age"
    },
    "stats": {
      "label": "Activity stats",
      "hint": "Connections, active time and data shared"
    },
    "connections": {
      "label": "Connections list",
      "hint": "Usernames of your connections"
    }
  }
}
```

Dutch translations follow the same structure.

---

## Cooldown Storage

| Key | Type | Purpose |
|---|---|---|
| `cw_last_insight` | Unix timestamp (ms) | Last time insight popup was shown |
| `cw_ai_share_profile` | `"true"/"false"` | Profile toggle state |
| `cw_ai_share_stats` | `"true"/"false"` | Stats toggle state |
| `cw_ai_share_connections` | `"true"/"false"` | Connections toggle state |

All via `safeStorage` — safe in private browsing (no throws).

---

## What This Does NOT Include

- Conversation history / multi-turn chat
- Streaming responses (backend returns full answer at once)
- Push notifications for insights
- Any LLM implementation — that is the backend team's responsibility

---

## Backend Prompt

> **For the backend team:**
>
> We need two new endpoints under `/api/v1/ai` for the CrossWave AI Assistant feature. Both require authentication via the existing httpOnly session cookie.
>
> **1. `POST /api/v1/ai/chat`**
> Accepts a question and optional user context. Calls the LLM and returns a single answer. Each request is fully stateless — no conversation history.
>
> Request body:
> ```json
> {
>   "question": "string",
>   "context": {
>     "profile": { "name": "string", "bio": "string", "age": 0 },
>     "stats": { "connections": 0, "timeActive": 0, "dataShared": 0 },
>     "connections": [{ "username": "string" }]
>   }
> }
> ```
> All fields in `context` are optional. Response: `{ "answer": "string" }`.
>
> **2. `GET /api/v1/ai/insight`**
> Uses the authenticated user's server-side data to generate one short personalised insight (1–2 sentences max). If there is not enough data for a meaningful insight, return `{ "insight": null }`. The frontend enforces a 4-hour cooldown — this endpoint will not be called more than once per 4 hours per user. Response: `{ "insight": "string | null" }`.
>
> The LLM prompt must be instructed to keep answers concise and grounded in the provided data only — no hallucinated facts about the user.
