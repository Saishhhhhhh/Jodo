import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Syne } from 'next/font/google';
import "./globals.css";
import StoreLayoutWrapper from "@/components/StoreLayoutWrapper";

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-dm-sans' });
const syne = Syne({ subsets: ['latin'], display: 'swap', variable: '--font-syne' });

export const metadata: Metadata = {
  title: "Jodo Home | Crafting Comfort, Shaping Style",
  description: "Discover premium furniture and home decor. From modern minimalist to timeless classics — transform any space into a place you'll love.",
  verification: {
    google: "B2BvJ82mzIspAqj6NdRprEyOVcVu41bDFnN8gPsQEQI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="B2BvJ82mzIspAqj6NdRprEyOVcVu41bDFnN8gPsQEQI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`w-full relative pb-16 md:pb-0 ${dmSans.variable} ${syne.variable} font-sans`} style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
        <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
      </body>
    </html>
  );
}

