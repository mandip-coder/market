'use client'
import { App, ConfigProvider, Layout, theme } from "antd";
import React, { useMemo } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AppScrollbar from "../AppScrollBar";
import { useThemeContext } from "@/context/ThemeContextProvider";
import { Content } from "antd/es/layout/layout";
import { DefaultTheme } from "@/shared/constants/themeConfig";
import AppToaster from "../AppToaster/AppToaster";
import FadeEffects from "../FadeEffects/FadeEffects";
import en_US from 'antd/locale/en_US';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeContext();

  // Memoize theme configuration to prevent recalculation on every render
  const themeConfig = useMemo(() => ({
    ...(DefaultTheme[themeMode as "light" | "dark"]),
    token: {
      ...DefaultTheme[themeMode as "light" | "dark"].token,
      borderRadiusLG: 10,
      borderRadius: 10
    },
    components: {
      ...DefaultTheme[themeMode as "light" | "dark"].components,
      Button: {
        paddingInline: 10,
        controlHeight: 30,
        motionDurationMid: '0.3s',
      },
      Menu: {
        ...DefaultTheme[themeMode as "light" | "dark"].components?.Menu,
        borderRadiusLG: 8,
      }
    },
    algorithm: themeMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
  }), [themeMode]);

  return (
    <ConfigProvider
      locale={en_US}
      theme={themeConfig}
    >
      <App>
        <AppToaster />
        <Layout className='h-screen '>
          <Sidebar />
          <Layout>
            <AppScrollbar className="max-h-screen p-5">
              <Content>
                <FadeEffects type="slide">{children}</FadeEffects>
              </Content>
            </AppScrollbar>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
