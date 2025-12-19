'use client'
import LightRays from "@/components/LightRays/LightRays";
import { TestimonialSlider } from "@/components/TestimonialSlider/TestimonialSlider";
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
    <div className="flex !overflow-hidden h-screen bg-transparent dark:bg-black">
      <div className="max-w-5xl m-auto w-full">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex flex-col items-center justify-center">
          {children}
        </motion.div>
      </div>
      {/* <div className="w-1/2 hidden lg:block relative">
        <TestimonialSlider />
        <div className="bg-[url(/market-access/images/login-image.jpg)] h-screen bg-cover">
        </div>

      </div> */}
    </div>

<div className="absolute top-0 left-0 w-full h-full -z-1">
  <LightRays
    raysOrigin="top-center"
    raysColor="#1a4d7a"
    raysSpeed={1.5}
    lightSpread={0.8}
    rayLength={1.2}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0.1}
    distortion={0.05}
  />
</div>
    <ToastContainer />
  </ConfigProvider>
}
