import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

import { BottomNav } from "@/components/BottomNav";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "SPAquatoria — Живая косметика",
  description:
    "Определи свою дошу и получи персональный ритуал ухода. 350+ средств для лица, тела и волос. Основано на аюрведе и науке.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SPAquatoria",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 pb-tab">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
