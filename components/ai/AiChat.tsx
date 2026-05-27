"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import BackButton from "@components/BackButton";
import { useAIContext } from "@hooks/useAIContext";
import { chatRequest } from "@services/AiService";

export default function AiChat() {
  const t = useTranslations("ai");
  const context = useAIContext();

  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;
    const q = question.trim();
    setLastQuestion(q);
    setQuestion("");
    setIsLoading(true);
    setError(null);
    try {
      const result = await chatRequest(q, context);
      setAnswer(result.answer);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code === "NETWORK_ERROR" ? t("error.NETWORK_ERROR") : t("error.UNKNOWN_ERROR"));
    } finally {
      setIsLoading(false);
    }
  };

  const hasContent = lastQuestion || isLoading || answer || error;

  return (
    <section className="app-screen flex flex-col p-0">
      {/* App bar */}
      <div className="app-bar px-4">
        <BackButton />
        <h2 className="flex-1 text-center text-[17px] font-semibold">{t("title")}</h2>
        <div className="w-12" aria-hidden />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        {!hasContent && (
          <p className="text-ink-400 text-sm italic text-center mt-8">{t("placeholder")}</p>
        )}

        {/* User question bubble */}
        {lastQuestion && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5">
              <p className="text-[14px] text-white leading-snug">{lastQuestion}</p>
            </div>
          </div>
        )}

        {/* AI answer */}
        {isLoading && (
          <div className="flex items-center gap-2">
            <span className="text-brand-600 text-base">✦</span>
            <p className="text-ink-400 text-sm animate-pulse">{t("loading")}</p>
          </div>
        )}

        {error && <p className="status-error">{error}</p>}

        {!isLoading && answer && (
          <div className="animate-rise flex gap-2.5">
            <span className="text-brand-600 text-base mt-0.5 shrink-0">✦</span>
            <div className="ai-prose flex-1 text-[15px] text-ink-900 leading-relaxed">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
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
            inputMode="text"
            autoComplete="off"
            autoCapitalize="sentences"
            autoCorrect="off"
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
