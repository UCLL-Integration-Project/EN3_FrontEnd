"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Download } from "lucide-react";

interface FirmwareProps {
  installed: string;
  latest: string;
  flash: (msg: string) => void;
}

export function FirmwareCard({ installed, latest, flash }: FirmwareProps) {
  const t = useTranslations("device");
  const [fw, setFw] = useState<"available" | "installing" | "current">(
    installed === latest ? "current" : "available"
  );
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function install() {
    if (fw !== "available") return;
    setFw("installing");
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          setFw("current");
          flash(t("manage.noteFirmwareUpdated", { version: latest }));
          return 100;
        }
        return p + 5;
      });
    }, 110);
  }

  return (
    <div className="card mt-3">
      {fw === "current" ? (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink-900">
              {t("manage.firmwareUpToDate")}
            </p>
            <p className="text-[12px] text-ink-500">
              {t("manage.firmwareVersion", { version: latest })}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
              <Download size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink-900">
                {t("manage.firmwareUpdateAvailable")}
              </p>
              <p className="text-[12px] text-ink-500">
                {installed} → {latest}
              </p>
            </div>
          </div>
          {fw === "installing" ? (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-pill bg-ink-100">
                <div
                  className="h-full rounded-pill bg-brand-gradient transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-[12px] font-medium text-ink-500">
                {t("manage.firmwareInstalling", { progress })}
              </p>
            </div>
          ) : (
            <button className="btn-secondary mt-4 w-full" onClick={install}>
              {t("manage.firmwareInstall")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
