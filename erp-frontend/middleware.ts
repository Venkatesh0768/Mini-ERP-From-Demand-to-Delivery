import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — Server-side route protection.
 *
 * Blocks unauthenticated users from accessing all protected ERP routes.
 * AuthContext handles expired/invalid cookie cases client-side after refresh fails.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refreshToken");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/vendors") ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/manufacturing") ||
    pathname.startsWith("/bom") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/audit-logs");

  if (isProtectedRoute && !hasRefreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/vendors/:path*",
    "/sales/:path*",
    "/purchases/:path*",
    "/manufacturing/:path*",
    "/bom/:path*",
    "/inventory/:path*",
    "/audit-logs/:path*",
  ],
};
