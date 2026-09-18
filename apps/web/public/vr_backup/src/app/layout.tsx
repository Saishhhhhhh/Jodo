import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ARView — QR-Based Web AR Product Preview",
  description: "Experience products in your space before you buy. Scan QR codes to view AR-enabled products in your room using augmented reality.",
  keywords: ["AR", "augmented reality", "QR code", "3D product preview", "Web AR", "furniture AR", "product visualization"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ARView — Web AR Product Preview",
    description: "Scan QR codes to view products in AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
