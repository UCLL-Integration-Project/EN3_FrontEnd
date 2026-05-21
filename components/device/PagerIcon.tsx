"use client";

export function PagerIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <rect x="4" y="8.5" width="11" height="7" rx="1" />
      <circle cx="19.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
