import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import DocumentLang from "@/components/DocumentLang";
import { getSiteBaseUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  themeColor: "#f5f5f7",
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
      <body className="site-atmosphere min-h-screen font-sans">
        <DocumentLang />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
