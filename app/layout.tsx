import SessionProvider from "@/context/SessionProvider";
import SidebarContextProvider from "@/context/SidebarContextProvider";
import ThemeContextProvider from "@/context/ThemeContextProvider";
import "@/styles/globals.css";

import "@fontsource/be-vietnam";
import "@fontsource/be-vietnam/500.css";

import { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import "simplebar-react/dist/simplebar.min.css";
import { Suspense } from "react";
import StoreHydrator from "@/components/StoreHydrator";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import DropDownHydrator from "@/components/DropDownHydrator";

// Configure fonts with next/font/google
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-inter",
});
export const metadata: Metadata = {
  title: {
    default: "Market Access",
    template: "%s | Market Access",
  },
  description:
    "AI-based Pharma covigilance database designed to transform drug safety monitoring and ensure patient well-being.",
  openGraph: {
    title: "Market Access",
    description:
      "AI-based Pharma covigilance database designed to transform drug safety monitoring and ensure patient well-being.",
    type: "website",
    locale: "en_US",
    siteName: "Market Access",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} `}>
      <body className="font-sans">
        <Suspense>
          <SessionProvider>
            <StoreHydrator />
            <SuspenseWithBoundary loading={null}>
              <DropDownHydrator />
            </SuspenseWithBoundary>
            <ThemeContextProvider>
              <SidebarContextProvider>{children}</SidebarContextProvider>
            </ThemeContextProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
