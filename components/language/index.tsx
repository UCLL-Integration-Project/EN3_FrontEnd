"use client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";

const languages = [
  { value: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { value: "nl", label: "Nederlands", short: "NL", flag: "🇳🇱" },
];

export default function LanguageChip() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const t = useTranslations("language");

  const currentLocale = params?.locale ? (Array.isArray(params.locale) ? params.locale[0] : params.locale) : "en";
  const current = languages.find((l) => l.value === currentLocale) ?? languages[0];

  const handleLanguageChange = (newLocale: string) => {
    setOpen(false);
    startTransition(() => {
      const path = pathname.split("/");
      path[1] = newLocale;
      router.push(path.join("/"));
    });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="chip">
        <Globe size={16} aria-hidden="true" />
        <span>{current.label}</span>
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <div className="sheet-backdrop" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end justify-center">
          <DialogPanel className="sheet-bottom">
            <div className="sheet-grabber" aria-hidden="true" />
            <h3 className="px-5 pb-2">{t("chooseLanguage")}</h3>
            <div className="flex flex-col gap-1 px-2">
              {languages.map((lang) => {
                const active = lang.value === currentLocale;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`sheet-row flex ${active ? "sheet-row-active" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[22px]" aria-hidden="true">
                        {lang.flag}
                      </span>
                      <span>{lang.label}</span>
                    </span>
                    {active && <Check size={20} className="text-brand-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
