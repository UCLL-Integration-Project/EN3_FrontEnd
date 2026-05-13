"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, User } from "@types";
import { logoutRequest } from "@services/UserService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
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

  const updateUser = (userData: Partial<User>) => {
    const updated = { ...user, ...userData };
    sessionStorage.setItem("loggedInUser", JSON.stringify(updated));
    setUser(updated);
  };

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};
