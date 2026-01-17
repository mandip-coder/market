'use client'

import { useThemeContext } from "@/context/ThemeContextProvider";
import { DefaultTheme } from "@/shared/constants/themeConfig";
import { ConfigProvider, theme } from "antd";
import en_US from 'antd/locale/en_US';
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import React from "react";
import { ToastContainer } from "react-toastify";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeMode } = useThemeContext();
  return <ConfigProvider
    locale={en_US}
    theme={{

      ...(DefaultTheme[themeMode as "light" | "dark"]),
      token: {
        ...DefaultTheme[themeMode as "light" | "dark"].token,
      },
      components: {
        ...DefaultTheme[themeMode as "light" | "dark"].components,
        Button: {
          motionDurationMid: '0.3s',
        },
        Menu: {
          ...DefaultTheme[themeMode as "light" | "dark"].components?.Menu,
          borderRadiusLG: 8,
        }

      },
      algorithm:
        themeMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
    }}
  >
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 text-center text-sm">
      Powered by <a className="text-primary" target="_blank" href="https://topialifesciences.com">Topia Lifesciences</a>
      <div className="text-gray-500 text-xs">
        All rights reserved &copy;  2026
      </div>
    </div>
    <div className="flex !overflow-hidden h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      <div className="max-w-5xl m-auto w-full">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex flex-col items-center justify-center">
          {children}
        </motion.div>
      </div>

    </div>


    <ToastContainer />
  </ConfigProvider>
}
