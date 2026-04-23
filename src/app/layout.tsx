import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import DocumentLang from "@/components/DocumentLang";
import { getSiteBaseUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased bg-stone-950 text-stone-100 min-h-screen">
        <DocumentLang />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
