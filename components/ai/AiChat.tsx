"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import BackButton from "@components/BackButton";
import { useAIContext } from "@hooks/useAIContext";
import { chatRequest, getInsightHistoryRequest, type ChatMessage, type InsightHistoryEntry } from "@services/AiService";
import BambooAvatar from "@components/ai/BambooAvatar";

const SUGGESTED = [
  "suggested.social",
  "suggested.activity",
  "suggested.network",
  "suggested.crosswave",
] as const;

export default function AiChat() {
  const t = useTranslations("ai");
  const context = useAIContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightHistory, setInsightHistory] = useState<InsightHistoryEntry[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    getInsightHistoryRequest()
      .then(setInsightHistory)
      .catch(() => {});
  }, []);

  const handleSend = async (q: string) => {
    const text = q.trim();
    if (!text || isLoading) return;
    setQuestion("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);

    try {
      const result = await chatRequest(text, context, messages);
      setMessages([...next, { role: "assistant", content: result.answer }]);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      if (code === "AI_UNAVAILABLE") {
        setError(t("error.AI_UNAVAILABLE"));
      } else if (code === "NETWORK_ERROR") {
        setError(t("error.NETWORK_ERROR"));
      } else {
        setError(t("error.UNKNOWN_ERROR"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading && !error;

  return (
    <section className="app-screen flex flex-col p-0">
      {/* App bar */}
      <div className="app-bar px-4">
        <BackButton />
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <h2 className="text-[17px] font-semibold">Bamboo AI</h2>
        </div>
        <div className="w-12" aria-hidden />
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        {isEmpty && (
          <>
            <p className="text-ink-400 text-sm italic text-center mt-4">{t("placeholder")}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {SUGGESTED.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSend(t(key))}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[13px] text-brand-700 active:bg-brand-100 transition-colors"
                >
                  {t(key)}
                </button>
              ))}
            </div>

            {insightHistory.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-1 py-1 text-[13px] font-semibold text-ink-500"
                  onClick={() => setHistoryExpanded((v) => !v)}
                >
                  <span>{t("history.title")} ({insightHistory.length})</span>
                  <span className="text-ink-300">{historyExpanded ? "▲" : "▼"}</span>
                </button>

                {historyExpanded && (
                  <div className="mt-2 flex flex-col gap-2">
                    {insightHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-ink-100"
                      >
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-500">
                          <span className="mr-1">🐼</span>
                          {entry.personalized ? t("insight.eyebrow") : t("insight.eyebrow_fact")}
                        </p>
                        <p className="text-[13px] leading-relaxed text-ink-800">{entry.insight}</p>
                        <p className="mt-1 text-[10px] text-ink-400">
                          {new Date(entry.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5">
                <p className="text-[14px] text-white leading-snug">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="animate-rise flex gap-2.5">
              <BambooAvatar size={22} className="shrink-0 mt-0.5" />
              <div className="ai-prose flex-1 text-[15px] text-ink-900 leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex items-center gap-2">
            <BambooAvatar size={22} className="shrink-0 animate-pulse opacity-60" />
            <p className="text-ink-400 text-sm animate-pulse">{t("loading")}</p>
          </div>
        )}

        {error && <p className="status status-error">{error}</p>}

        <div ref={bottomRef} />
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
              if (e.key === "Enter" && !isLoading && question.trim()) handleSend(question);
            }}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="sentences"
            autoCorrect="off"
          />
          <button
            type="button"
            className="btn shrink-0 px-4 py-2 text-[14px]"
            onClick={() => handleSend(question)}
            disabled={!question.trim() || isLoading}
          >
            {t("send")}
          </button>
        </div>
      </div>
    </section>
  );
}
