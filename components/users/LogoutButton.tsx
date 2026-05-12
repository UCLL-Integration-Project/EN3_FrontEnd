import useAuth from "@hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function () {
  const router = useRouter();
  const { logout } = useAuth();
  const t = useTranslations("header");

  const handleLogout = () => {
    logout();
    router.push(`/login`);
  };

  return (
    <>
      <button
        onClick={() => {
          handleLogout();
        }}
        aria-label="Log out"
        className="btn"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          logout
        </span>
        <span>{t("nav.logout")}</span>
      </button>
    </>
  );
}
