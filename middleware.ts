// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("adminSession")?.value;
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isAdminPage && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
