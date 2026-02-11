import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana 提示词库",
  description: "Nano Banana 与 Nano Banana Pro 精选提示词集合，支持一键复制",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-stone-950 text-stone-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
