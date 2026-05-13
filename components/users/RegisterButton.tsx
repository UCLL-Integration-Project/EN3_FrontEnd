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

  const handleRegister = () => {
    router.push(`/signup`);
  };

  return (
    <>
      <button
        onClick={() => {
          handleRegister();
        }}
        aria-label="Register"
        className="btn"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          person_add
        </span>
        <span>{t("nav.register")}</span>
      </button>
    </>
  );
}
