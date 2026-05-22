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
