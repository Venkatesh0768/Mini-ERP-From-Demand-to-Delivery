import { RoleType, User } from "@/types/auth.types";

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: User | null, role: RoleType): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Check if the user is a system administrator.
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "ROLE_ADMIN");
}

// ─── Route Access Map ─────────────────────────────────────────────────────────
// Mirrors backend SecurityConfig exactly.
// Key = route prefix, value = roles that may access it.
// ROLE_ADMIN always has full access — it's added implicitly in canAccessRoute().

const ROUTE_ROLES: Record<string, RoleType[]> = {
  "/dashboard":     ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER"],
  "/audit-logs":    ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER"],
  "/admin":         ["ROLE_ADMIN"],
  "/products":      ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_INVENTORY_MANAGER"],
  "/inventory":     ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_INVENTORY_MANAGER"],
  "/customers":     ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_SALES_USER"],
  "/sales":         ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_SALES_USER"],
  "/vendors":       ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_PURCHASE_USER"],
  "/purchases":     ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_PURCHASE_USER"],
  "/bom":           ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_MANUFACTURING_USER"],
  "/manufacturing": ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_MANUFACTURING_USER"],
  // /profile is accessible to all authenticated users
  "/profile":       ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_SALES_USER",
                     "ROLE_PURCHASE_USER", "ROLE_MANUFACTURING_USER",
                     "ROLE_INVENTORY_MANAGER", "ROLE_USER"],
};

/**
 * Returns true if the given user is allowed to access a route.
 * Matches by prefix — e.g. "/products" covers "/products/123".
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;
  // Find the most specific matching prefix
  const match = Object.keys(ROUTE_ROLES)
    .filter((prefix) => route === prefix || route.startsWith(prefix + "/"))
    .sort((a, b) => b.length - a.length)[0]; // longest prefix wins
  if (!match) return true; // unknown route → let backend enforce
  return ROUTE_ROLES[match].some((r) => user.roles.includes(r));
}

/**
 * Returns the list of routes the user can access.
 * Used by the Sidebar to filter nav items.
 */
export function accessibleRoutes(user: User | null): Set<string> {
  const result = new Set<string>();
  for (const route of Object.keys(ROUTE_ROLES)) {
    if (canAccessRoute(user, route)) result.add(route);
  }
  return result;
}

// ─── Role display helpers ─────────────────────────────────────────────────────

/**
 * Get a human-readable display name for a role.
 */
export function roleLabel(role: RoleType): string {
  const map: Record<RoleType, string> = {
    ROLE_USER: "User",
    ROLE_ADMIN: "Admin",
    ROLE_SALES_USER: "Sales",
    ROLE_PURCHASE_USER: "Purchasing",
    ROLE_MANUFACTURING_USER: "Manufacturing",
    ROLE_INVENTORY_MANAGER: "Inventory",
    ROLE_BUSINESS_OWNER: "Business Owner",
  };
  return map[role] ?? role;
}

/**
 * Get the tailwind color classes for a role badge.
 */
export function roleBadgeClass(role: RoleType): string {
  const map: Record<RoleType, string> = {
    ROLE_ADMIN:               "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
    ROLE_USER:                "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30",
    ROLE_SALES_USER:          "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    ROLE_PURCHASE_USER:       "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    ROLE_MANUFACTURING_USER:  "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30",
    ROLE_INVENTORY_MANAGER:   "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30",
    ROLE_BUSINESS_OWNER:      "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30",
  };
  return map[role] ?? "bg-slate-500/15 text-slate-400";
}

/**
 * Get the user's full display name.
 */
export function displayName(user: User | null): string {
  if (!user) return "Guest";
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get initials for avatar placeholder.
 */
export function initials(user: User | null): string {
  if (!user) return "?";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || user.email[0].toUpperCase();
}

/** All selectable roles for admin UI — ordered for display. */
export const ALL_ROLES: RoleType[] = [
  "ROLE_USER",
  "ROLE_ADMIN",
  "ROLE_SALES_USER",
  "ROLE_PURCHASE_USER",
  "ROLE_MANUFACTURING_USER",
  "ROLE_INVENTORY_MANAGER",
  "ROLE_BUSINESS_OWNER",
];
