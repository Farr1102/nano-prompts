import { headers } from "next/headers";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "zh";
  const lang = locale === "en" ? "en" : "zh-CN";

  return (
    <html lang={lang}>
      <body className="antialiased bg-stone-950 text-stone-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
