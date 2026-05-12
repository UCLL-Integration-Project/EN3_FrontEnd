"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, User } from "@types";
import { logoutRequest } from "@services/UserService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    sessionStorage.removeItem("loggedInUser");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
