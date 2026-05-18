import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@context/AuthContext";
import { DeviceProvider } from "@context/DeviceContext";
import "@styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  title: "CrossWave",
  description: "CrossWave — your mobile companion app.",
  applicationName: "CrossWave",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CrossWave",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <DeviceProvider>
              <div className="app-frame">
                <main className="app-main no-scrollbar">{children}</main>
              </div>
            </DeviceProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
