"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bluetooth,
  BluetoothSearching,
  ChevronRight,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Watch,
} from "lucide-react";
import { useDevice } from "@context/DeviceContext";
import { SignalBars } from "./DeviceUI";

/* -------------------------------------------------------------------------
 * Companion-device pairing wizard.
 * This flow is mandatory: CrossWave needs one linked companion per account
 * to function, so there is no skip/close affordance here.
 * Frontend only — the scan/pair lifecycle is simulated with timers.
 * Wire `Web Bluetooth API` (navigator.bluetooth) into the marked spots later.
 * All user-visible copy comes from the `device` message catalogue.
 * ---------------------------------------------------------------------- */

type Step = "intro" | "scanning" | "pairing" | "connected";

type FoundDevice = {
  id: string;
  name: string;
  signal: number; // 0–3
};

/* Mock scan results. These stand in for BLE-advertised device names, which
   are not localized — real results replace them via navigator.bluetooth. */
const NEARBY_DEVICES: FoundDevice[] = [
  { id: "CW-2F8A", name: "CrossWave Band 2", signal: 3 },
  { id: "CW-9C41", name: "CW Companion", signal: 2 },
  { id: "BT-D7E0", name: "Unknown device", signal: 1 },
];

const PAIRING_CODE = ["4", "8", "2", "9", "1", "7"];

/* Catalogue keys (device.setup.*) resolved at render time. */
const PREREQS = ["prereq1", "prereq2", "prereq3"] as const;
const WIZARD_STEPS = ["stepScan", "stepPair", "stepDone"] as const;

/** Decorative scanning radar — emanating rings around a Bluetooth core. */
function Radar() {
  return (
    <div className="relative mx-auto my-3 h-[210px] w-[210px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.9}s` }}
          className="absolute inset-0 rounded-full border-2 border-brand-400/40 animate-ping"
        />
      ))}
      <div className="absolute inset-[16%] rounded-full bg-brand-50" />
      <div className="absolute inset-[32%] rounded-full bg-brand-100" />
      <div className="absolute inset-0 m-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop">
        <BluetoothSearching size={34} strokeWidth={2} />
      </div>
    </div>
  );
}

function Stepper({ active, labels }: { active: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`flex h-6 items-center gap-1.5 rounded-pill px-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              i < active
                ? "bg-brand-100 text-brand-700"
                : i === active
                  ? "bg-brand-gradient text-white shadow-pop"
                  : "bg-ink-100 text-ink-400"
            }`}
          >
            {i < active ? <Check size={12} strokeWidth={3} /> : i + 1}
            {label}
          </span>
          {i < labels.length - 1 && (
            <span
              className={`h-[2px] w-3 rounded-full ${
                i < active ? "bg-brand-300" : "bg-ink-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DeviceSetup() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("device");
  const { linkDevice } = useDevice();

  const [step, setStep] = useState<Step>("intro");
  const [visibleCount, setVisibleCount] = useState(0);
  const [scanNonce, setScanNonce] = useState(0);
  const [selected, setSelected] = useState<FoundDevice | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  const pairTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStepIndex =
    step === "intro" || step === "scanning" ? 0 : step === "pairing" ? 1 : 2;

  /* Reveal nearby devices progressively while scanning. */
  useEffect(() => {
    if (step !== "scanning") return;
    // TODO: replace timers with navigator.bluetooth.requestDevice() results.
    const timers = [700, 1500, 2500].map((delay, i) =>
      setTimeout(() => setVisibleCount(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, scanNonce]);

  /* Clear a pending pairing timer if the user leaves mid-connect, so its
     callback never updates state on an unmounted component. */
  useEffect(
    () => () => {
      if (pairTimer.current) clearTimeout(pairTimer.current);
    },
    [],
  );

  function startScan() {
    setVisibleCount(0);
    setScanNonce((n) => n + 1);
    setStep("scanning");
  }

  function pickDevice(device: FoundDevice) {
    setSelected(device);
    setDeviceName(device.name);
    setStep("pairing");
  }

  function confirmPairing() {
    setConnecting(true);
    // TODO: establish GATT connection here.
    pairTimer.current = setTimeout(() => {
      pairTimer.current = null;
      setConnecting(false);
      setStep("connected");
    }, 1900);
  }

  function rescan() {
    setSelected(null);
    startScan();
  }

  return (
    <section className="app-screen">
      {/* In-screen header — no close button: pairing is required to use
          the app, so this flow cannot be dismissed. */}
      <div className="flex items-center gap-2.5 pt-safe-t">
        <span className="brand-mark" aria-hidden="true">
          <Bluetooth size={18} strokeWidth={2.25} />
        </span>
        <span className="text-[13px] font-semibold uppercase tracking-wider text-ink-500">
          {t("setup.eyebrow")}
        </span>
      </div>

      <div className="mt-4">
        <Stepper
          active={activeStepIndex}
          labels={WIZARD_STEPS.map((key) => t(`setup.${key}`))}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* STEP — intro                                                     */}
      {/* ---------------------------------------------------------------- */}
      {step === "intro" && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="relative mx-auto mt-2 flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50" />
            <span className="absolute inset-[14%] rounded-full bg-brand-100" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop">
              <Bluetooth size={30} strokeWidth={2.25} />
            </span>
          </div>

          <h2 className="mt-6 text-center">{t("setup.introTitle")}</h2>
          <p className="mt-2 text-center text-ink-600">
            {t("setup.introBody")}
          </p>

          <div className="card mt-6">
            <h5>{t("setup.prereqTitle")}</h5>
            <ul className="mt-3 flex flex-col gap-3">
              {PREREQS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-[14px] leading-snug text-ink-700">
                    {t(`setup.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="action-dock mt-auto">
            <button className="btn-cta" onClick={startScan}>
              {t("setup.startScan")}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STEP — scanning                                                  */}
      {/* ---------------------------------------------------------------- */}
      {step === "scanning" && (
        <div className="mt-2 flex flex-1 flex-col">
          <Radar />
          <h3 className="text-center">{t("setup.scanningTitle")}</h3>
          <p className="mt-1 text-center text-ink-500">
            {t("setup.scanningBody")}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {NEARBY_DEVICES.slice(0, visibleCount).map((device) => (
              <button
                key={device.id}
                onClick={() => pickDevice(device)}
                className="flex w-full items-center gap-3 rounded-sheet bg-white p-4 text-left shadow-card ring-1 ring-ink-100 transition-transform duration-100 animate-sheet-in active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Watch size={20} strokeWidth={2.25} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink-900">
                    {device.name}
                  </span>
                  <span className="block text-[12px] text-ink-500">
                    {device.id}
                  </span>
                </span>
                <SignalBars level={device.signal} />
                <ChevronRight
                  size={18}
                  className="text-ink-300"
                  strokeWidth={2.5}
                />
              </button>
            ))}

            {visibleCount < NEARBY_DEVICES.length && (
              <div className="flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-ink-400">
                <Loader2 size={16} className="animate-spin" />
                {t("setup.scanningMore")}
              </div>
            )}
          </div>

          <div className="action-dock mt-auto">
            <p className="mb-3 text-center text-[12px] text-ink-400">
              {t("setup.rescanHint")}
            </p>
            <button
              className="btn-ghost w-full"
              onClick={rescan}
              disabled={visibleCount < NEARBY_DEVICES.length}
            >
              <RefreshCw size={16} strokeWidth={2.5} className="mr-2" />
              {t("setup.rescan")}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STEP — pairing                                                   */}
      {/* ---------------------------------------------------------------- */}
      {step === "pairing" && selected && (
        <div className="mt-6 flex flex-1 flex-col">
          {connecting ? (
            <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
              <span className="relative flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-brand-300/50 animate-ping" />
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop">
                  <Bluetooth size={28} strokeWidth={2.25} />
                </span>
              </span>
              <h3 className="mt-6">{t("setup.connectingTitle")}</h3>
              <p className="mt-1 text-ink-500">
                {t("setup.connectingBody", { name: selected.name })}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Watch size={26} strokeWidth={2.25} />
                </span>
                <h3 className="mt-4">{t("setup.confirmTitle")}</h3>
                <p className="mt-1 text-ink-600">
                  {t.rich("setup.confirmBody", {
                    name: selected.name,
                    strong: (chunks) => (
                      <span className="font-semibold text-ink-800">
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              </div>

              <div className="card mt-6">
                <div className="flex justify-center gap-2">
                  {PAIRING_CODE.map((digit, i) => (
                    <span
                      key={i}
                      className="flex h-14 w-10 items-center justify-center rounded-2xl bg-brand-50 font-display text-[26px] text-brand-700 ring-1 ring-brand-100"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] font-medium text-ink-500">
                  <ShieldCheck size={14} className="text-brand-500" />
                  {t("setup.encrypted")}
                </div>
              </div>

              <div className="action-dock mt-auto">
                <button className="btn-cta" onClick={confirmPairing}>
                  {t("setup.codesMatch")}
                </button>
                <button className="btn-quiet mt-2 w-full" onClick={rescan}>
                  {t("setup.codesDontMatch")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STEP — connected                                                 */}
      {/* ---------------------------------------------------------------- */}
      {step === "connected" && selected && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={44} strokeWidth={2} />
            </span>
            <h2 className="mt-5">{t("setup.doneTitle")}</h2>
            <p className="mt-2 text-ink-600">
              {t("setup.doneBody", { name: selected.name })}
            </p>
          </div>

          <div className="card mt-6">
            <label className="field">
              <span className="field-label">{t("setup.nameLabel")}</span>
              <span className="field-control">
                <input
                  className="field-input"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t("defaultName")}
                  autoCapitalize="words"
                  autoCorrect="off"
                  maxLength={32}
                  enterKeyHint="done"
                />
              </span>
            </label>
          </div>

          <div className="action-dock mt-auto">
            <button
              className="btn-cta"
              onClick={() => {
                // Mark the account's device as linked, then leave setup —
                // replace() so this completed flow stays out of history.
                linkDevice();
                router.replace(`/${locale}/device`);
              }}
            >
              {t("setup.goToDevice")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
