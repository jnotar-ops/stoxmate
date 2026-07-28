import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stoxmate.vercel.app"),

  title: {
    default: "StoxMate",
    template: "%s | StoxMate",
  },

  description:
    "AI-powered market intelligence, research and portfolio insights for Australian investors.",

  applicationName: "StoxMate",

  keywords: [
    "ASX",
    "Australian shares",
    "Investing",
    "Stocks",
    "AI",
    "Portfolio",
    "Market Intelligence",
    "Finance",
    "Research",
  ],

  authors: [{ name: "StoxMate" }],

  creator: "StoxMate",

  publisher: "StoxMate",

  appleWebApp: {
    capable: true,
    title: "StoxMate",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },

  openGraph: {
    title: "StoxMate",
    description:
      "AI-powered market intelligence, research and portfolio insights for Australian investors.",
    siteName: "StoxMate",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "StoxMate",
    description:
      "AI-powered market intelligence, research and portfolio insights for Australian investors.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0C1222",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0C1222] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}