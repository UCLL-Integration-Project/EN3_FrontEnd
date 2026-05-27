import { getTranslations } from "next-intl/server";

export const runtime = "edge";

export default async function OfflinePage() {
  const t = await getTranslations("offline");

  return (
    <div className="app-frame flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 px-8 text-center">
        <span className="text-5xl">📡</span>
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink-900">
          {t("title")}
        </h1>
        <p className="text-[14px] text-ink-500">
          {t("body")}
        </p>
      </div>
    </div>
  );
}
