import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

// Presence-only check: fast and edge-safe. The real, cryptographic check
// (verifySessionCookie against Firebase Auth) runs in requireAdminSession()
// inside every admin Server Action — this proxy is a UX redirect, not the
// security boundary. See src/lib/actions/auth.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
