import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/transactions", "/chat", "/settings", "/my-kost", "/admin"];

export function middleware(request) {
  const sessionToken = request.cookies.get("kos_session")?.value;
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/chat/:path*", "/settings/:path*", "/my-kost/:path*", "/admin/:path*"]
};
