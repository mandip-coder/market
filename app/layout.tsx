import SessionProvider from "@/context/SessionProvider";
import SidebarContextProvider from "@/context/SidebarContextProvider";
import ThemeContextProvider from "@/context/ThemeContextProvider";
import "@/styles/globals.css";

import "@fontsource/be-vietnam";
import "@fontsource/be-vietnam/500.css";

import { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import DropDownHydrator from "@/components/DropDownHydrator";
import StoreHydrator from "@/components/StoreHydrator";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { QueryProvider } from "@/context/QueryProvider";
import "simplebar-react/dist/simplebar.min.css";

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
    "Comprehensive pharmaceutical market access CRM platform for managing healthcare relationships, deals, and product distribution. Streamline your pharma sales operations with intelligent lead tracking, HCO management, and activity monitoring.",
  openGraph: {
    title: "Market Access - Pharmaceutical CRM Platform",
    description:
      "Streamline pharmaceutical market access with our comprehensive CRM solution. Manage healthcare organizations, track deals, monitor sales activities, and optimize product distribution across the healthcare ecosystem.",
    type: "website",
    locale: "en_US",
    siteName: "Market Access",
  },
  keywords: [
    "pharmaceutical CRM",
    "market access",
    "healthcare sales",
    "pharma distribution",
    "HCO management",
    "pharmaceutical deals",
    "healthcare relationship management",
    "pharma sales tracking",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} `}>
      <body className="font-sans">
        <SessionProvider>
          <StoreHydrator />
          <SuspenseWithBoundary loading={null}>
            <DropDownHydrator />
          </SuspenseWithBoundary>
          <ThemeContextProvider>
            <SidebarContextProvider>
              <QueryProvider>{children}
              </QueryProvider>
            </SidebarContextProvider>
          </ThemeContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
