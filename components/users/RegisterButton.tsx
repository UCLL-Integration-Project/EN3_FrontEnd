import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function RegisterButton() {
  const router = useRouter();
  const t = useTranslations("header");

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
