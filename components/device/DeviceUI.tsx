"use client";

/**
 * Shared presentational bits for the companion-device screens.
 * Pure UI — no Bluetooth/backend logic lives here.
 */

/** Three-bar signal-strength indicator. `level` is 0–3. */
export function SignalBars({
  level,
  light = false,
}: {
  level: number;
  light?: boolean;
}) {
  return (
    <span
      className="flex items-end gap-[3px]"
      aria-label={`Signal strength ${level} of 3`}
      role="img"
    >
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          style={{ height: `${5 + bar * 4}px` }}
          className={`w-[3px] rounded-full ${
            bar <= level
              ? light
                ? "bg-white"
                : "bg-brand-500"
              : light
                ? "bg-white/30"
                : "bg-ink-200"
          }`}
        />
      ))}
    </span>
  );
}

/** Visual-only switch. Drive the surrounding row's onClick to flip state. */
export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-7 w-[46px] shrink-0 items-center rounded-pill transition-colors duration-200 ${
        on ? "bg-brand-500" : "bg-ink-200"
      }`}
    >
      <span
        className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </span>
  );
}

/** Horizontal battery glyph with a fill proportional to `percent`. */
export function BatteryGlyph({
  percent,
  charging = false,
}: {
  percent: number;
  charging?: boolean;
}) {
  const tone =
    percent <= 15
      ? "bg-red-500"
      : percent <= 30
        ? "bg-secondary-500"
        : "bg-brand-500";
  return (
    <span className="flex items-center" aria-hidden="true">
      <span className="relative h-7 w-[52px] rounded-md p-[3px] ring-2 ring-ink-300">
        <span
          className={`block h-full rounded-[3px] transition-[width] duration-500 ${
            charging ? "bg-brand-400" : tone
          }`}
          style={{ width: `${Math.max(percent, 6)}%` }}
        />
      </span>
      <span className="h-3 w-[3px] rounded-r-sm bg-ink-300" />
    </span>
  );
}
