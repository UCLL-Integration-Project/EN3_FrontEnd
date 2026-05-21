import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Define supported locales (ideally shared from a config file)
const locales = ["en", "nl"];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "";

  // Defend against invalid locales (e.g., system paths like .well-known)
  if (!locales.includes(locale)) {
    notFound();
  }

  try {
    return {
      messages: (await import(`./public/locales/${locale}/common.json`)).default,
      locale,
    };
  } catch (error) {
    // Fallback if a valid locale's JSON file is physically missing
    notFound();
  }
});