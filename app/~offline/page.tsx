export const runtime = "edge";

export default function OfflinePage() {
  return (
    <div className="app-frame flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 px-8 text-center">
        <span className="text-5xl">📡</span>
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink-900">
          You&apos;re offline
        </h1>
        <p className="text-[14px] text-ink-500">
          Check your connection and try again.
        </p>
      </div>
    </div>
  );
}
