import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Syne } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-dm-sans' });
const syne = Syne({ subsets: ['latin'], display: 'swap', variable: '--font-syne' });

export const metadata: Metadata = {
  title: "Jodo Home | Crafting Comfort, Shaping Style",
  description: "Discover premium furniture and home decor. From modern minimalist to timeless classics — transform any space into a place you'll love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`w-full relative ${dmSans.variable} ${syne.variable} font-sans`} style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
