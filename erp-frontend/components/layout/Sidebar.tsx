"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Factory,
  Layers, Warehouse, Users, Building2, ScrollText, Shield,
  Settings, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { accessibleRoutes, displayName, initials } from "@/lib/utils/roles";

interface NavItem  { href: string; label: string; icon: React.ElementType }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products",  label: "Products",  icon: Package },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/vendors",   label: "Vendors",   icon: Building2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/sales",         label: "Sales Orders",     icon: ShoppingCart },
      { href: "/purchases",     label: "Purchase Orders",  icon: Truck },
      { href: "/manufacturing", label: "Manufacturing",    icon: Factory },
      { href: "/bom",           label: "Bill of Materials",icon: Layers },
    ],
  },
  {
    label: "Inventory",
    items: [{ href: "/inventory", label: "Stock Ledger", icon: Warehouse }],
  },
  {
    label: "System",
    items: [
      { href: "/audit-logs", label: "Audit Logs",  icon: ScrollText },
      { href: "/admin",      label: "Admin Panel", icon: Shield },
      { href: "/profile",    label: "Settings",    icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const allowed = accessibleRoutes(user);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-3.5rem)] sticky top-14 self-start overflow-y-auto">
      <nav className="flex-1 px-3 py-4 space-y-5">
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => allowed.has(item.href));
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visible.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} />
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight size={12} className="text-indigo-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User card at bottom ─────────────────────────────────────────── */}
      {user && (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors group"
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden bg-indigo-100 ring-1 ring-gray-200 shrink-0">
            {user.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt={displayName(user)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                {initials(user)}
              </div>
            )}
          </div>
          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{displayName(user)}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <Settings size={13} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
        </Link>
      )}
    </aside>
  );
}
