/**
 * Role-aware API access helpers.
 *
 * Maps exactly to the backend SecurityConfig authorizeHttpRequests rules.
 * Use these before calling any ERP API to avoid firing requests that the
 * backend will reject with 401/403 — which would also pollute audit logs.
 *
 * Rules mirrored from SecurityConfig:
 *   GET  /products/**   → ADMIN, BUSINESS_OWNER, INVENTORY_MANAGER
 *   POST /products/**   → ADMIN, BUSINESS_OWNER
 *   PUT  /products/**   → ADMIN, BUSINESS_OWNER
 *   DELETE /products/** → ADMIN, BUSINESS_OWNER
 *   /boms/**            → ADMIN, BUSINESS_OWNER, MANUFACTURING_USER
 *   /inventory/**       → ADMIN, BUSINESS_OWNER, INVENTORY_MANAGER
 *   /manufacturing-orders/** → ADMIN, BUSINESS_OWNER, MANUFACTURING_USER
 *   /customers/**       → ADMIN, BUSINESS_OWNER, SALES_USER
 *   /sales-orders/**    → ADMIN, BUSINESS_OWNER, SALES_USER
 *   /purchase-orders/** → ADMIN, BUSINESS_OWNER, PURCHASE_USER
 *   /vendors/**         → ADMIN, BUSINESS_OWNER, PURCHASE_USER
 *   /audit-logs/**      → ADMIN, BUSINESS_OWNER
 *   /dashboard/**       → ADMIN, BUSINESS_OWNER
 *   /admin/**           → ADMIN only
 */

import type { RoleType, User } from "@/types/auth.types";

function has(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return user.roles.some((r) => roles.includes(r));
}

const ADMIN_OWNER: RoleType[] = ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER"];
const ADMIN_OWNER_INVENTORY: RoleType[] = ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_INVENTORY_MANAGER"];
const ADMIN_OWNER_SALES: RoleType[] = ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_SALES_USER"];
const ADMIN_OWNER_PURCHASE: RoleType[] = ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_PURCHASE_USER"];
const ADMIN_OWNER_MFG: RoleType[] = ["ROLE_ADMIN", "ROLE_BUSINESS_OWNER", "ROLE_MANUFACTURING_USER"];

export const canApi = {
  // Products
  readProducts:   (u: User | null) => has(u, [...ADMIN_OWNER_INVENTORY, "ROLE_SALES_USER", "ROLE_PURCHASE_USER", "ROLE_MANUFACTURING_USER"]),
  writeProducts:  (u: User | null) => has(u, ADMIN_OWNER),

  // Customers & Sales
  readCustomers:  (u: User | null) => has(u, ADMIN_OWNER_SALES),
  readSales:      (u: User | null) => has(u, ADMIN_OWNER_SALES),

  // Vendors & Purchases
  readVendors:    (u: User | null) => has(u, ADMIN_OWNER_PURCHASE),
  readPurchases:  (u: User | null) => has(u, ADMIN_OWNER_PURCHASE),

  // Manufacturing & BOM
  readMfg:        (u: User | null) => has(u, ADMIN_OWNER_MFG),
  readBom:        (u: User | null) => has(u, ADMIN_OWNER_MFG),

  // Inventory ledger
  readInventory:  (u: User | null) => has(u, ADMIN_OWNER_INVENTORY),

  // Audit & Dashboard
  readAuditLogs:  (u: User | null) => has(u, ADMIN_OWNER),
  readDashboard:  (u: User | null) => has(u, ADMIN_OWNER),

  // Admin panel
  admin:          (u: User | null) => has(u, ["ROLE_ADMIN"]),
};
