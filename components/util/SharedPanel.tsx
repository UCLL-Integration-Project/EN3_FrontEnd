"use client";

import { ReactNode } from "react";

type SharedPanelProps = {
  title: string;
  loading: boolean;
  loadingText: string;
  error: string | null;
  showErrorAsCard?: boolean;
  children: ReactNode;
};

export default function SharedPanel({
  title,
  loading,
  loadingText,
  error,
  showErrorAsCard = false,
  children,
}: SharedPanelProps) {
  // Shared uniform loading skeleton view
  if (loading) {
    return (
      <div className="px-5 pb-4">
        <div className="card">
          <p className="text-[13px] text-ink-400">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Shared full-screen error view
  if (error && showErrorAsCard) {
    return (
      <div className="px-5 pb-4">
        <div className="card">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-2">
      {/* Unified Section Header Label */}
      <h5 className="mb-2 px-1 text-[14px] font-medium text-ink-700">
        {title}
      </h5>

      {/* Inline Section Error Alert */}
      {error && !showErrorAsCard && (
        <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-sheet-in">
          {error}
        </div>
      )}

      {children}
    </div>
  );
}
