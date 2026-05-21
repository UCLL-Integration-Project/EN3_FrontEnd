import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "nl", "fr"];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) || "en";
  const locale = SUPPORTED_LOCALES.includes(requested) ? requested : "en";

  return {
    messages: (await import(`./public/locales/${locale}/common.json`)).default,
    locale,
  };
});