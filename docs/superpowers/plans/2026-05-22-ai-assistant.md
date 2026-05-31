# AI Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI assistant to CrossWave — a full-page Q&A screen (accessible via FAB on home), a proactive insight popup on home load (4-hour cooldown), and user-controlled data-sharing toggles in settings.

**Architecture:** `AiService.ts` calls the two backend endpoints; `useAIContext` hook assembles opted-in user data from localStorage flags; `AiChat` and `AiInsightPopup` are pure UI components wired to the service. The home screen gains a FAB + popup trigger, and the settings page gains an `AiSettingsCard`.

**Tech Stack:** Next.js App Router, React hooks, TypeScript, Tailwind CSS, next-intl, `safeStorage` (context/safeStorage.ts), Jest + jsdom for unit tests.

---

## File Map

| Action | Path                                    | Responsibility                                             |
| ------ | --------------------------------------- | ---------------------------------------------------------- |
| Modify | `types/index.ts`                        | Add `UserAIContext` type                                   |
| Modify | `public/locales/en/common.json`         | Add `ai.*` i18n keys                                       |
| Modify | `public/locales/nl/common.json`         | Add `ai.*` i18n keys (Dutch)                               |
| Create | `services/AiService.ts`                 | `chatRequest()` + `insightRequest()`                       |
| Create | `__tests__/AiService.test.ts`           | Unit tests for both service functions                      |
| Create | `hooks/useAIContext.ts`                 | Assemble `UserAIContext` from localStorage flags + fetches |
| Create | `components/ai/AiChat.tsx`              | Full-page Q&A UI                                           |
| Create | `components/ai/AiInsightPopup.tsx`      | Bottom-sheet proactive insight                             |
| Create | `components/ai/AiSettingsCard.tsx`      | Three opt-in data toggles                                  |
| Create | `app/[locale]/ai/page.tsx`              | Route: AuthGuard + AiChat                                  |
| Modify | `components/HomeScreen.tsx`             | Add FAB + insight popup trigger                            |
| Modify | `components/users/UserSettingsForm.tsx` | Render AiSettingsCard below ChangePasswordForm             |

---

## Task 1: Add `UserAIContext` type and i18n keys

**Files:**
- Modify: `types/index.ts`
- Modify: `public/locales/en/common.json`
- Modify: `public/locales/nl/common.json`

- [ ] **Step 1: Add `UserAIContext` to `types/index.ts`**

Append at the end of the file (after the `UserStats` type):

```ts
export type UserAIContext = {
  profile?: { name: string; bio: string; age: number };
  stats?: { connections: number; timeActive: number; dataShared: number };
  connections?: { username: string }[];
};
```

- [ ] **Step 2: Add English i18n keys to `public/locales/en/common.json`**

Add the following block to `en/common.json`, inside the root JSON object (e.g. after the `"home"` block):

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

- [ ] **Step 3: Add Dutch i18n keys to `public/locales/nl/common.json`**

Add the same structure in Dutch:

```json
"ai": {
  "title": "CrossWave AI",
  "placeholder": "Stel me een vraag over je gegevens…",
  "send": "Vraag",
  "loading": "Denken…",
  "error": {
    "NETWORK_ERROR": "Kon de server niet bereiken. Probeer opnieuw.",
    "UNKNOWN_ERROR": "Er ging iets mis. Probeer opnieuw."
  },
  "insight": {
    "eyebrow": "Dagelijks inzicht",
    "askMore": "Vraag meer →",
    "dismiss": "Sluiten"
  },
  "settings": {
    "title": "AI-gegevenstoegang",
    "profile": {
      "label": "Profiel & bio",
      "hint": "Je naam, bio en leeftijd"
    },
    "stats": {
      "label": "Activiteitsstatistieken",
      "hint": "Verbindingen, actieve tijd en gedeelde gegevens"
    },
    "connections": {
      "label": "Verbindingenlijst",
      "hint": "Gebruikersnamen van je verbindingen"
    }
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors relating to `UserAIContext`.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts public/locales/en/common.json public/locales/nl/common.json
git commit -m "feat(ai): add UserAIContext type and i18n keys"
```

---

## Task 2: Create `AiService.ts`

**Files:**
- Create: `services/AiService.ts`
- Create: `__tests__/AiService.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/AiService.test.ts`:

```ts
import { chatRequest, insightRequest } from "@services/AiService";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe("chatRequest", () => {
  it("returns answer on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "You have 5 connections." }),
    });
    const result = await chatRequest("How many connections do I have?", {});
    expect(result).toEqual({ answer: "You have 5 connections." });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ai/chat"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("throws NETWORK_ERROR on TypeError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(chatRequest("hi", {})).rejects.toThrow("NETWORK_ERROR");
  });

  it("throws error code from response body on non-ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ code: "UNAUTHORIZED" }] }),
    });
    await expect(chatRequest("hi", {})).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("insightRequest", () => {
  it("returns insight string on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ insight: "Go for a walk today!" }),
    });
    const result = await insightRequest();
    expect(result).toEqual({ insight: "Go for a walk today!" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ai/insight"),
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("returns null insight when backend has none", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ insight: null }),
    });
    const result = await insightRequest();
    expect(result).toEqual({ insight: null });
  });

  it("throws NETWORK_ERROR on TypeError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(insightRequest()).rejects.toThrow("NETWORK_ERROR");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=AiService --no-coverage
```

Expected: FAIL — `Cannot find module '@services/AiService'`

- [ ] **Step 3: Implement `services/AiService.ts`**

```ts
import type { UserAIContext } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    let code = "UNKNOWN_ERROR";
    try {
      const body = await response.json();
      if (body?.errors?.[0]?.code) code = body.errors[0].code;
    } catch {
      // non-JSON body — keep UNKNOWN_ERROR
    }
    throw new Error(code);
  }
};

export const chatRequest = async (
  question: string,
  context: UserAIContext,
): Promise<{ answer: string }> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question, context }),
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const insightRequest = async (): Promise<{ insight: string | null }> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/ai/insight`, {
      method: "GET",
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- --testPathPattern=AiService --no-coverage
```

Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add services/AiService.ts __tests__/AiService.test.ts
git commit -m "feat(ai): add AiService with chatRequest and insightRequest"
```

---

## Task 3: Create `useAIContext` hook

**Files:**
- Create: `hooks/useAIContext.ts`

- [ ] **Step 1: Create `hooks/useAIContext.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import { safeStorage } from "@context/safeStorage";
import { getMyProfileRequest, getStatsRequest, getConnectionsRequest } from "@services/UserService";
import type { UserAIContext } from "@types";

export function useAIContext(): UserAIContext {
  const [context, setContext] = useState<UserAIContext>({});

  useEffect(() => {
    const shareProfile = safeStorage.get("cw_ai_share_profile") === "true";
    const shareStats = safeStorage.get("cw_ai_share_stats") === "true";
    const shareConnections = safeStorage.get("cw_ai_share_connections") === "true";

    const fetches: Promise<void>[] = [];
    const built: UserAIContext = {};

    if (shareProfile) {
      fetches.push(
        getMyProfileRequest()
          .then((data) => {
            built.profile = {
              name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
              bio: data.bio ?? "",
              age: data.age ?? 0,
            };
          })
          .catch(() => {}),
      );
    }

    if (shareStats) {
      fetches.push(
        getStatsRequest()
          .then((data) => {
            if (data) built.stats = data;
          })
          .catch(() => {}),
      );
    }

    if (shareConnections) {
      fetches.push(
        getConnectionsRequest()
          .then((data) => {
            built.connections = data.map((u) => ({ username: u.username ?? "" }));
          })
          .catch(() => {}),
      );
    }

    Promise.all(fetches).then(() => setContext({ ...built }));
  }, []);

  return context;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useAIContext.ts
git commit -m "feat(ai): add useAIContext hook"
```

---

## Task 4: Create `AiChat` component

**Files:**
- Create: `components/ai/AiChat.tsx`

- [ ] **Step 1: Create `components/ai/AiChat.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BackButton from "@components/BackButton";
import { useAIContext } from "@hooks/useAIContext";
import { chatRequest } from "@services/AiService";

export default function AiChat() {
  const t = useTranslations("ai");
  const context = useAIContext();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await chatRequest(question.trim(), context);
      setAnswer(result.answer);
      setQuestion("");
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code === "NETWORK_ERROR" ? t("error.NETWORK_ERROR") : t("error.UNKNOWN_ERROR"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="app-screen flex flex-col p-0">
      {/* App bar */}
      <div className="app-bar px-4">
        <BackButton />
        <h2 className="flex-1 text-center text-[17px] font-semibold">{t("title")}</h2>
        <div className="w-12" aria-hidden />
      </div>

      {/* Answer area */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {error && <p className="status-error mb-4">{error}</p>}
        {isLoading && (
          <p className="text-ink-400 text-sm animate-pulse">{t("loading")}</p>
        )}
        {!isLoading && answer && (
          <p className="text-ink-900 text-[15px] leading-relaxed animate-rise">{answer}</p>
        )}
        {!isLoading && !answer && !error && (
          <p className="text-ink-400 text-sm italic">{t("placeholder")}</p>
        )}
      </div>

      {/* Sticky input */}
      <div className="border-t border-ink-100 bg-white px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="field-control flex gap-2 pr-1">
          <input
            type="text"
            className="field-input"
            placeholder={t("placeholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && question.trim()) handleSend();
            }}
            autoComplete="off"
            autoCapitalize="sentences"
          />
          <button
            type="button"
            className="btn shrink-0 px-4 py-2 text-[14px]"
            onClick={handleSend}
            disabled={!question.trim() || isLoading}
          >
            {t("send")}
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ai/AiChat.tsx
git commit -m "feat(ai): add AiChat full-page Q&A component"
```

---

## Task 5: Create `AiInsightPopup` component

**Files:**
- Create: `components/ai/AiInsightPopup.tsx`

- [ ] **Step 1: Create `components/ai/AiInsightPopup.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Props = {
  insight: string;
  onDismiss: () => void;
};

export default function AiInsightPopup({ insight, onDismiss }: Props) {
  const t = useTranslations("ai");
  const router = useRouter();

  const handleAskMore = () => {
    onDismiss();
    router.push("/ai");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="sheet-backdrop z-40"
        onClick={onDismiss}
        aria-hidden="true"
      />
      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-bottom z-50"
      >
        <div className="sheet-grabber" />
        <div className="relative px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
          {/* Dismiss */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("insight.dismiss")}
            className="icon-btn absolute right-3 top-0 text-xl leading-none"
          >
            ×
          </button>
          {/* Eyebrow */}
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-600">
            ✦ {t("insight.eyebrow")}
          </p>
          {/* Insight text */}
          <p className="mb-5 text-[15px] leading-relaxed text-ink-900">{insight}</p>
          {/* Ask more */}
          <button type="button" onClick={handleAskMore} className="btn-ghost">
            {t("insight.askMore")}
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ai/AiInsightPopup.tsx
git commit -m "feat(ai): add AiInsightPopup bottom sheet component"
```

---

## Task 6: Create AI page route

**Files:**
- Create: `app/[locale]/ai/page.tsx`

- [ ] **Step 1: Create `app/[locale]/ai/page.tsx`**

```tsx
"use client";

import { AuthGuard } from "@components/auth/RouteGuard";
import AiChat from "@components/ai/AiChat";

export default function AiPage() {
  return (
    <AuthGuard>
      <AiChat />
    </AuthGuard>
  );
}
```

- [ ] **Step 2: Run the dev server and navigate to `/en/ai`**

```bash
npm run dev
```

Open `http://localhost:8080/en/ai` in a browser. While logged out, it should redirect to `/en/login`. While logged in, it should show the AiChat screen with a placeholder and disabled send button.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/ai/page.tsx
git commit -m "feat(ai): add /ai route with AuthGuard"
```

---

## Task 7: Add FAB + insight popup to `HomeScreen`

**Files:**
- Modify: `components/HomeScreen.tsx`

The current `HomeScreen.tsx` has:
- A brand banner section
- A nav list section
- A sign-out button section

We need to:
1. Add a `relative` positioning wrapper to the outer `<section>` so the FAB can be positioned absolutely
2. Import `Link`, `insightRequest`, `AiInsightPopup`, and `safeStorage`
3. Add `useState` for `insight` and a `useEffect` for the insight trigger
4. Render the FAB as an `<Link>` positioned absolute in the bottom-right area
5. Conditionally render `AiInsightPopup`

- [ ] **Step 1: Update `components/HomeScreen.tsx`**

Replace the full file with:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChart2,
  ChevronRight,
  Cpu,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { insightRequest } from "@services/AiService";
import { safeStorage } from "@context/safeStorage";
import AiInsightPopup from "@components/ai/AiInsightPopup";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home");
  const router = useRouter();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";

  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const last = safeStorage.get("cw_last_insight");
    if (last && Date.now() - Number(last) < FOUR_HOURS) return;

    insightRequest()
      .then(({ insight: text }) => {
        if (text) setInsight(text);
      })
      .catch(() => {});
  }, []);

  const handleDismissInsight = () => {
    safeStorage.set("cw_last_insight", String(Date.now()));
    setInsight(null);
  };

  const navItems = [
    { icon: User,      label: t("nav.profile"),     href: "/profile",       admin: false },
    { icon: Users,     label: t("nav.connections"),  href: "/connections",   admin: false },
    { icon: Cpu,       label: t("nav.device"),       href: "/device",        admin: false },
    { icon: BarChart2, label: t("nav.stats"),        href: "/stats",         admin: false },
    { icon: Settings,  label: t("nav.settings"),     href: "/settings",      admin: false },
    ...(user?.role === "ADMIN"
      ? [{ icon: Shield, label: t("nav.admin"), href: "/admin/members", admin: true }]
      : []),
  ] as { icon: typeof User; label: string; href: string; admin: boolean }[];

  return (
    <section className="relative flex min-h-full flex-col p-0">
      {/* Brand gradient banner */}
      <div className="bg-brand-gradient px-5 pb-8 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <p
          className="text-[11px] font-medium uppercase tracking-widest text-white/65"
          suppressHydrationWarning
        >
          {t(`dashboard.${greetingKey}`)}
        </p>
        <p className="mt-1 text-[26px] font-extrabold tracking-tight text-white">
          {displayName}
        </p>
      </div>

      {/* Nav list */}
      <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
        {navItems.map(({ icon: Icon, label, href, admin }, index) => (
          <Link
            key={href}
            href={href}
            style={{ animationDelay: `${index * 45}ms` }}
            className="animate-rise flex items-center gap-3 rounded-sheet bg-white px-4 py-3.5 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                admin
                  ? "bg-secondary-50 text-secondary-600"
                  : "bg-brand-50 text-brand-600"
              }`}
            >
              <Icon size={20} strokeWidth={2.25} aria-hidden />
            </span>
            <span
              className={`flex-1 text-[15px] font-semibold ${
                admin ? "text-secondary-700" : "text-ink-900"
              }`}
            >
              {label}
            </span>
            <ChevronRight size={18} className="text-ink-300" strokeWidth={2.5} aria-hidden />
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="mt-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="tap flex w-full items-center justify-center gap-2 rounded-pill px-4 py-3 text-[13px] font-semibold text-ink-500 ring-1 ring-ink-200 transition-colors duration-100 active:bg-ink-100"
        >
          <LogOut size={15} strokeWidth={2.25} aria-hidden />
          {t("signOut")}
        </button>
      </div>

      {/* AI floating action button */}
      <Link
        href={"/ai"}
        aria-label={t("nav.ai")}
        className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-[22px] text-white shadow-pop active:scale-95 transition-transform duration-100"
      >
        ✦
      </Link>

      {/* Proactive insight popup */}
      {insight && (
        <AiInsightPopup insight={insight} onDismiss={handleDismissInsight} />
      )}
    </section>
  );
}
```

- [ ] **Step 2: Add `nav.ai` i18n key to both locale files**

In `public/locales/en/common.json`, inside the `"home" > "nav"` object, add:
```json
"ai": "AI Assistant"
```

In `public/locales/nl/common.json`, inside the `"home" > "nav"` object, add:
```json
"ai": "AI-assistent"
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test manually**
  - Open `http://localhost:8080/en` while logged in
  - The FAB (✦ circle) should appear in the bottom-right, above the sign-out button
  - Tapping it should navigate to `/en/ai`
  - The insight popup will not appear until the backend endpoint exists — that's expected

- [ ] **Step 5: Commit**

```bash
git add components/HomeScreen.tsx public/locales/en/common.json public/locales/nl/common.json
git commit -m "feat(ai): add FAB and insight popup trigger to HomeScreen"
```

---

## Task 8: Add `AiSettingsCard` and wire it into settings

**Files:**
- Create: `components/ai/AiSettingsCard.tsx`
- Modify: `components/users/UserSettingsForm.tsx`

- [ ] **Step 1: Create `components/ai/AiSettingsCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { safeStorage } from "@context/safeStorage";

type ToggleKey = "cw_ai_share_profile" | "cw_ai_share_stats" | "cw_ai_share_connections";

type ToggleRowProps = {
  storageKey: ToggleKey;
  label: string;
  hint: string;
};

function ToggleRow({ storageKey, label, hint }: ToggleRowProps) {
  const [checked, setChecked] = useState(() => safeStorage.get(storageKey) === "true");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setChecked(val);
    safeStorage.set(storageKey, String(val));
  };

  return (
    <label className="field-row cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="mt-0.5 h-5 w-5 shrink-0 rounded accent-brand-600"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-ink-900">{label}</span>
        <span className="text-[12px] text-ink-500">{hint}</span>
      </span>
    </label>
  );
}

export default function AiSettingsCard() {
  const t = useTranslations("ai");

  return (
    <div className="card flex flex-col gap-4">
      <h5 className="text-[15px] font-semibold text-ink-900">{t("settings.title")}</h5>
      <ToggleRow
        storageKey="cw_ai_share_profile"
        label={t("settings.profile.label")}
        hint={t("settings.profile.hint")}
      />
      <ToggleRow
        storageKey="cw_ai_share_stats"
        label={t("settings.stats.label")}
        hint={t("settings.stats.hint")}
      />
      <ToggleRow
        storageKey="cw_ai_share_connections"
        label={t("settings.connections.label")}
        hint={t("settings.connections.hint")}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add `AiSettingsCard` to `components/users/UserSettingsForm.tsx`**

The current file imports:
```tsx
import LogoutSection from "@components/users/LogoutSection";
import BackButton from "@components/BackButton";
```

Add import after `LogoutSection`:
```tsx
import AiSettingsCard from "@components/ai/AiSettingsCard";
```

The current render section is:
```tsx
<div className="flex flex-col gap-4 pb-8">
  <ProfileForm initialProfile={profile} />
  <ChangePasswordForm />
  <LogoutSection />
</div>
```

Change it to:
```tsx
<div className="flex flex-col gap-4 pb-8">
  <ProfileForm initialProfile={profile} />
  <ChangePasswordForm />
  <AiSettingsCard />
  <LogoutSection />
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test manually**
  - Open `http://localhost:8080/en/settings` while logged in
  - An "AI data access" card should appear between the change-password section and the logout section
  - Toggling a checkbox should persist across page refreshes (localStorage)

- [ ] **Step 5: Commit**

```bash
git add components/ai/AiSettingsCard.tsx components/users/UserSettingsForm.tsx
git commit -m "feat(ai): add AiSettingsCard with data-sharing toggles to settings"
```

---

## Task 9: Full integration smoke test

No new files. Manual verification pass.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test the AI page flow**
  1. Log in, land on home screen
  2. Tap ✦ FAB → should navigate to `/en/ai`
  3. Page shows "Ask me anything…" placeholder and disabled "Ask" button
  4. Type a question → "Ask" button enables
  5. Submit → loading state shows "Thinking…"
  6. _(Backend not live yet)_ → network error shows "Couldn't reach the server. Try again."
  7. Back button returns to home

- [ ] **Step 3: Test the settings toggles**
  1. Navigate to `/en/settings`
  2. Scroll to "AI data access" card
  3. Toggle "Profile & bio" on → reload page → checkbox is still checked
  4. Toggle it off → reload → unchecked

- [ ] **Step 4: Run all unit tests**

```bash
npm test -- --no-coverage
```

Expected: PASS — `AiService` tests pass; no other tests broken.

- [ ] **Step 5: Commit (if any lint fixes needed)**

```bash
git add -A
git commit -m "feat(ai): complete AI assistant frontend implementation"
```

---

## Self-Review Notes

**Spec coverage:**
- [x] `POST /api/v1/ai/chat` — `chatRequest()` in AiService.ts (Task 2)
- [x] `GET /api/v1/ai/insight` — `insightRequest()` in AiService.ts (Task 2)
- [x] `UserAIContext` type — Task 1
- [x] Full-page `/ai` route with AuthGuard — Task 6
- [x] App bar: BackButton + "CrossWave AI" title — Task 4
- [x] Placeholder text on load — Task 4
- [x] Send button disabled on empty — Task 4
- [x] Input disabled + loading during request — Task 4
- [x] Error banners (`NETWORK_ERROR`, `UNKNOWN_ERROR`) — Task 4
- [x] Answer replaces placeholder, input clears — Task 4
- [x] FAB (56×56px, brand gradient, ✦, bottom-right) — Task 7 (14rem = 56px using h-14 w-14)
- [x] 4-hour cooldown check on home mount — Task 7
- [x] Insight popup with eyebrow, text, ask-more, dismiss — Task 5
- [x] Dismiss writes cooldown timestamp — Task 7
- [x] Silently fail if insight API errors — Task 7
- [x] 3 opt-in toggles in settings — Task 8
- [x] All defaults `false` — Task 8 (safeStorage returns null if unset, `=== "true"` is false)
- [x] `useAIContext` reads flags + fetches — Task 3
- [x] i18n EN + NL — Task 1, Task 7 Step 2
- [x] `AiInsightPopup` role="dialog" aria-modal="true" — Task 5

**No placeholders found.**

**Type consistency check:**
- `UserAIContext` defined in Task 1, used in `useAIContext` (Task 3) and `chatRequest` (Task 2) — consistent
- `chatRequest(question: string, context: UserAIContext)` — matches usage in `AiChat` (Task 4)
- `insightRequest()` returns `{ insight: string | null }` — matches destructuring in HomeScreen (Task 7)
- `AiInsightPopup` prop `{ insight: string; onDismiss: () => void }` — matches HomeScreen usage (Task 7)
