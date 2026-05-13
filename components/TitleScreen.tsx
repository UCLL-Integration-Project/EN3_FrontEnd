"use client";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "next-intl";
import LoginButton from "./users/LoginButton";

export default function TitleScreen() {
  const { user } = useAuth();
  const t = useTranslations("home");

  return (
    <>
      <div>{user ? <h1>{t("welcome")}</h1> : <LoginButton />}</div>
    </>
  );
}
