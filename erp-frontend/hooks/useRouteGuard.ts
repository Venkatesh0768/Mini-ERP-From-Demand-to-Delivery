"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute } from "@/lib/utils/roles";

/**
 * Client-side route guard.
 *
 * Call at the top of any protected page. If the authenticated user lacks
 * the required role for the current route (mirroring backend SecurityConfig),
 * they are redirected to /dashboard (or the first route they CAN access).
 *
 * Returns `allowed: boolean` so the page can render a spinner while checking.
 */
export function useRouteGuard(): { allowed: boolean; checking: boolean } {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checking = status === "loading";
  const allowed =
    status === "loading" || // still loading — don't block yet
    (status === "authenticated" && canAccessRoute(user, pathname));

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!canAccessRoute(user, pathname)) {
      // Redirect to the first accessible route for this user
      const fallbacks = [
        "/sales",
        "/purchases",
        "/manufacturing",
        "/bom",
        "/products",
        "/inventory",
        "/profile",
      ];
      const first = fallbacks.find((r) => canAccessRoute(user, r));
      router.replace(first ?? "/profile");
    }
  }, [status, user, pathname, router]);

  return { allowed: allowed && !checking, checking };
}
