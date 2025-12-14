// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

// Define your custom user interface
interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  permissions?: string[];
  role?: string | null;
  accessToken?: string | null;
}

// 1. Set the default value to `undefined` to signify "no provider"
const AuthContext = createContext<Session | null | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode, }) => {
  const { data: session } = useSession()
  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. The hook now checks for `undefined` to find the real error state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context) throw new Error("useAuth must be used within a AuthProvider");
  return context; // Type is Session | null
};