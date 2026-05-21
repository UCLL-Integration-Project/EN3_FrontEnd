import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@context/AuthContext";
import { DeviceProvider } from "@context/DeviceContext";
import "@styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers"; // 1. Import cookies utility

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

// ... (Keep your existing APP_NAME, metadata, and viewport objects exactly as they are) ...

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  // 2. Extract the cookie securely on the server
  // Note: cookies() is awaited here as per Next.js 15+ standards
  const cookieStore = await cookies(); 
  const token = cookieStore.get("authToken")?.value;

  let initialUser = null;

  // 3. If a token exists, fetch the user session before the page renders
  if (token) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // CRITICAL: Manually pass the token to the Java backend
          "Cookie": `authToken=${token}`, 
        },
        // Ensure Next.js doesn't cache the active session between different users
        cache: "no-store", 
      });

      if (response.ok) {
        initialUser = await response.json();
      }
    } catch (error) {
      console.error("SSR Session Fetch Failed:", error);
    }
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* 4. Hydrate the AuthProvider with the server-fetched user */}
          <AuthProvider initialUser={initialUser}>
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