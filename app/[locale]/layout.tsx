import Header from "@components/header";
import { AuthProvider } from "@context/AuthContext";
import "@styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return (
    <html lang={locale}>
      <body className="flex flex-1 flex-col h-screen w-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <Header />
            <main className="flex flex-1 flex-col items-center justify-center">{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
