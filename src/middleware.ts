import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname === "/") {
    const acceptLang = (request.headers.get("accept-language") || "").toLowerCase();
    const prefersZh = acceptLang.includes("zh");
    return NextResponse.redirect(new URL(prefersZh ? "/zh" : "/en", request.url));
  }

  const locale = pathname.startsWith("/en") ? "en" : "zh";
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: ["/", "/zh", "/en", "/zh/:path*", "/en/:path*"],
};
