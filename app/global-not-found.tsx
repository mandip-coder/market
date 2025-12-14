import NotFound from '@/components/NotFound/NotFound';
import "@/styles/globals.css";
import "@fontsource/be-vietnam";
import "@fontsource/be-vietnam/500.css";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import 'nprogress/nprogress.css';
import "simplebar-react/dist/simplebar.min.css";
dayjs.extend(customParseFormat);
// Configure fonts with next/font/google
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic',],
  display: 'swap',
  variable: '--font-inter',
})
export const metadata: Metadata = {
  title: {
    default: "Market Access",
    template: "%s | Market Access",
  },
  description: "AI-based Pharma covigilance database designed to transform drug safety monitoring and ensure patient well-being.",
  openGraph: {
    title: "Market Access",
    description: "AI-based Pharma covigilance database designed to transform drug safety monitoring and ensure patient well-being.",
    type: "website",
    locale: "en_US",
    siteName: "Market Access",
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} `}
    >
      <body className="font-sans">
        <NotFound />
      </body>
    </html>
  );
}