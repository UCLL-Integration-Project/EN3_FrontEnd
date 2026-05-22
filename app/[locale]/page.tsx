"use client";
import useAuth from "@hooks/useAuth";
import TitleScreen from "@components/TitleScreen";
import HomeScreen from "@components/HomeScreen";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <HomeScreen /> : <TitleScreen />;
}
