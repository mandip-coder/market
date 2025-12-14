"use client";

import { requestNotificationPermission } from "@/Utils/notifications";
import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import 'nprogress/nprogress.css';
export type ThemeMode = "light" | "dark";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.className = mode;
  document.body.setAttribute("theme", mode);
  localStorage.setItem("theme", mode);
};

// Get initial theme from localStorage or default to light
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = localStorage.getItem("theme") as ThemeMode | null;
  return storedTheme || 'light';
};

const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme());

  // Use useLayoutEffect to apply theme synchronously before paint
  useLayoutEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ themeMode, setThemeMode }), [themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
