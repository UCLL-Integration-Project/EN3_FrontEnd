"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@hooks/useAuth";

/* Defense-in-depth gate around /[locale]/admin/*. proxy.ts already bounces
   non-admins on the cw_admin hint cookie before the page renders, but that
   cookie is client-writable. This layout reads the authoritative role from
   AuthContext (sourced from /api/users/me) and redirects mismatches to /403. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const rejected = !isLoading && (!user || user.role !== "ADMIN");

  useEffect(() => {
    if (rejected) router.replace(`/${locale}/403`);
  }, [rejected, locale, router]);

  if (isLoading || rejected) return null;
  return <>{children}</>;
}
