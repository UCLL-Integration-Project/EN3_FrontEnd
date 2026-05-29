"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bluetooth, BluetoothSearching, Check, CheckCircle2, Eye, EyeOff, Loader2, Watch, Wifi } from "lucide-react";
import { useDevice } from "@context/DeviceContext";

// BLE UUIDs — must match the ESP32 firmware (src/ble_comm.cpp)
const DEVICE_BLE_NAME  = "CrossWave";
const WIFI_SERVICE     = "c7a2e3b4-d5f6-4789-a012-3456789abcde";
const WIFI_SSID_CHAR   = "c7a2e3b4-d5f6-4789-a012-3456789abcdf";
const WIFI_PASS_CHAR   = "c7a2e3b4-d5f6-4789-a012-3456789abce0";
const WIFI_STATUS_CHAR = "c7a2e3b4-d5f6-4789-a012-3456789abce1";

type Step = "intro" | "scanning" | "wifi" | "done";

const PREREQS = ["prereq1", "prereq2", "prereq3"] as const;
const WIZARD_STEPS = ["stepScan", "stepWifi", "stepDone"] as const;

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
            <span className={`h-[2px] w-3 rounded-full ${i < active ? "bg-brand-300" : "bg-ink-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DeviceSetup() {
  const router = useRouter();
  const t = useTranslations("device");
  const { linkDevice, setDeviceIp, deviceIp, setDeviceName: saveDeviceName } = useDevice();

  const [step, setStep] = useState<Step>("intro");

  // BLE
  const [bleDevice, setBleDevice] = useState<BluetoothDevice | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [bleError, setBleError] = useState<string | null>(null);

  // WiFi provisioning
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [wifiPhase, setWifiPhase] = useState<"sending" | "waiting">("sending");
  const [wifiError, setWifiError] = useState<string | null>(null);

  const bleAvailable = typeof navigator !== "undefined" && "bluetooth" in navigator;

  const activeStepIndex = step === "intro" || step === "scanning" ? 0 : step === "wifi" ? 1 : 2;

  // Opens the browser's BLE device picker, then immediately connects GATT
  // so the ESP32 reflects the connection before the WiFi form is shown.
  async function startScan() {
    setBleError(null);
    setStep("scanning");
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "CrossWave" }],
        optionalServices: [WIFI_SERVICE],
      });
      // Connect GATT right away — this triggers onConnect on the ESP32,
      // which transitions it from BLE_SETUP → BLE_CONNECTED and fires the
      // haptic/animation. Pre-discovering the service also makes the WiFi
      // write instant when the user submits the form.
      await device.gatt!.connect();
      setBleDevice(device);
      setDeviceName(device.name ?? DEVICE_BLE_NAME);
      setStep("wifi");
    } catch (err: unknown) {
      // NotFoundError = user dismissed the picker — fail silently.
      if (!(err instanceof Error && err.name === "NotFoundError")) {
        setBleError(err instanceof Error ? err.message : t("setup.bleError"));
      }
      setStep("intro");
    }
  }

  // Waits up to timeoutMs for the device's WiFi status characteristic to
  // report "CONNECTED:ip:port". Returns the IP string, or null on timeout.
  async function waitForWifiIp(char: BluetoothRemoteGATTCharacteristic, timeoutMs: number): Promise<string | null> {
    function parseIp(raw: DataView): string | null {
      const value = new TextDecoder().decode(raw);
      if (!value.startsWith("CONNECTED:")) return null;
      return value.split(":")[1] ?? null;
    }
    try {
      const current = await char.readValue();
      const ip = parseIp(current);
      if (ip) return ip;
    } catch {
      /* not connected yet — fall through to notifications */
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        char.removeEventListener("characteristicvaluechanged", onNotify);
        resolve(null);
      }, timeoutMs);

      function onNotify(e: Event) {
        const ip = parseIp((e.target as BluetoothRemoteGATTCharacteristic).value!);
        if (ip) {
          clearTimeout(timeout);
          char.removeEventListener("characteristicvaluechanged", onNotify);
          resolve(ip);
        }
      }

      char.addEventListener("characteristicvaluechanged", onNotify);
      char.startNotifications().catch(() => {
        /* notifications unavailable — let timeout expire */
      });
    });
  }

  // Writes SSID + password to the device over BLE GATT, then waits for the
  // device to join WiFi and report its IP via the status characteristic.
  async function sendWifiCredentials() {
    if (!bleDevice || !ssid) return;
    setWifiError(null);
    setProvisioning(true);
    setWifiPhase("sending");
    try {
      const server = await bleDevice.gatt!.connect();
      const service = await server.getPrimaryService(WIFI_SERVICE);
      const ssidChar = await service.getCharacteristic(WIFI_SSID_CHAR);
      const passChar = await service.getCharacteristic(WIFI_PASS_CHAR);
      const statusChar = await service.getCharacteristic(WIFI_STATUS_CHAR);

      const enc = new TextEncoder();
      await ssidChar.writeValueWithResponse(enc.encode(ssid));
      await passChar.writeValueWithResponse(enc.encode(password));

      // Wait up to 15 s for the device to connect and broadcast its IP.
      setWifiPhase("waiting");
      const ip = await waitForWifiIp(statusChar, 15_000);
      if (ip) setDeviceIp(ip);

      setStep("done");
    } catch (err: unknown) {
      setWifiError(err instanceof Error ? err.message : t("setup.wifiError"));
    } finally {
      setProvisioning(false);
      setWifiPhase("sending");
    }
  }

  return (
    <section className="app-screen">
      {/* Header — no close button: pairing is required to use the app */}
      <div className="flex items-center gap-2.5 pt-safe-t">
        <span className="brand-mark" aria-hidden="true">
          <Bluetooth size={18} strokeWidth={2.25} />
        </span>
        <span className="text-[13px] font-semibold uppercase tracking-wider text-ink-500">{t("setup.eyebrow")}</span>
      </div>

      <div className="mt-4">
        <Stepper active={activeStepIndex} labels={WIZARD_STEPS.map((key) => t(`setup.${key}`))} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTRO                                                               */}
      {/* ------------------------------------------------------------------ */}
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
          <p className="mt-2 text-center text-ink-600">{t("setup.introBody")}</p>

          {bleError && <div className="status status-error mt-4 animate-sheet-in">{bleError}</div>}

          {!bleAvailable && (
            <div className="status status-error mt-4">
              <p className="font-semibold">{t("setup.bleUnavailable")}</p>
              <p className="mt-0.5 text-[12px] opacity-80">{t("setup.bleUnavailableHint")}</p>
            </div>
          )}

          <div className="card mt-6">
            <h5>{t("setup.prereqTitle")}</h5>
            <ul className="mt-3 flex flex-col gap-3">
              {PREREQS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-[14px] leading-snug text-ink-700">{t(`setup.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="action-dock mt-auto">
            <button className="btn-cta" onClick={startScan} disabled={!bleAvailable}>
              {t("setup.startScan")}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SCANNING — radar shown while browser BLE picker is open            */}
      {/* ------------------------------------------------------------------ */}
      {step === "scanning" && (
        <div className="mt-2 flex flex-1 flex-col">
          <Radar />
          <h3 className="text-center">{t("setup.scanningTitle")}</h3>
          <p className="mt-1 text-center text-ink-500">{t("setup.scanningBody")}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[13px] font-medium text-ink-400">
            <Loader2 size={16} className="animate-spin" />
            {t("setup.scanningMore")}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* WIFI — send credentials to the device over BLE GATT               */}
      {/* ------------------------------------------------------------------ */}
      {step === "wifi" && bleDevice && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Watch size={26} strokeWidth={2.25} />
            </span>
            <h3 className="mt-4">{t("setup.wifiTitle")}</h3>
            <p className="mt-1 text-ink-600">{t("setup.wifiBody", { name: deviceName })}</p>
          </div>

          <div className="card mt-6 flex flex-col gap-4">
            <label className="field">
              <span className="field-label">{t("setup.wifiSsidLabel")}</span>
              <span className="field-control">
                <input
                  className="field-input"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="MyNetwork"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  inputMode="text"
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">{t("setup.wifiPassLabel")}</span>
              <span className="field-control field-control-icon-r">
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="field-icon-btn"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </span>
            </label>
          </div>

          {wifiError && <div className="status status-error mt-4 animate-sheet-in">{wifiError}</div>}

          <div className="action-dock mt-auto">
            <button className="btn-cta" onClick={sendWifiCredentials} disabled={!ssid || provisioning}>
              {provisioning ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {wifiPhase === "waiting" ? t("setup.wifiWaiting") : t("setup.wifiProvisioning")}
                </>
              ) : (
                <>
                  <Wifi size={18} />
                  {t("setup.wifiSend")}
                </>
              )}
            </button>
            <button className="btn-ghost mt-2 w-full" onClick={() => setStep("done")} disabled={provisioning}>
              {t("setup.wifiSkip")}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DONE                                                                */}
      {/* ------------------------------------------------------------------ */}
      {step === "done" && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={44} strokeWidth={2} />
            </span>
            <h2 className="mt-5">{t("setup.doneTitle")}</h2>
            <p className="mt-2 text-ink-600">{t("setup.doneBody", { name: deviceName || DEVICE_BLE_NAME })}</p>
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
                saveDeviceName(deviceName);
                if (deviceIp && deviceName) {
                  const ws = new WebSocket(`ws://${deviceIp}:81`);
                  ws.onopen = () => { ws.send(`NAME:${deviceName}`); ws.close(); };
                }
                linkDevice();
                router.replace("/device");
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
