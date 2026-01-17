// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient/apiClient";


const AuthContext = createContext<Session | null | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode, }) => {
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.accessToken) {
      apiClient.setToken(session.accessToken)
    } else {
      apiClient.clearToken()
    }
  }, [session])
  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context; // Type is Session | null
};
