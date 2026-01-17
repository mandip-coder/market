'use client'

import { getPath } from "@/lib/path";
import useMobile from "@/hooks/useMobile";
import { SessionProvider as MainSession } from "next-auth/react";
import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { SessionCountdown } from "@/components/SessionMonitor";
export default function SessionProvider({ children }: { children: ReactNode }) {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-800 px-6">
        <div className="max-w-md text-center p-6 rounded-2xl shadow-lg bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-indigo-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20h6l-.75-3M4 4h16v12H4z"
            />
          </svg>

          <h1 className="text-2xl font-semibold mb-2">Try on a Larger Screen</h1>
          <p className="text-base text-gray-600 mb-4">
            This app is designed for bigger displays.
            Please use a laptop, desktop, tablet, or TV for the best experience.
          </p>
          <p className="text-sm text-gray-400">
            Mobile support is not available yet — but we’re working on it!
          </p>
        </div>
      </div>
    );
  }

  return (
    <MainSession basePath={getPath("/api/authentication")} refetchOnWindowFocus={false} refetchInterval={0} >
      <SessionCountdown />
      <AuthProvider>{children}</AuthProvider>
    </MainSession>
  );
}
