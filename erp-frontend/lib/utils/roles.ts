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
