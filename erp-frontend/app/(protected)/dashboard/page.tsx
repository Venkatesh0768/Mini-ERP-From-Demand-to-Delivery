"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  Factory,
  Users,
  Building2,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { dashboardApi } from "@/lib/api/erp.api";
import type { DashboardStats } from "@/types/erp.types";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { displayName } from "@/lib/utils/roles";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { checking, allowed } = useRouteGuard();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    dashboardApi
      .getStats()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setStats(data);
      })
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, [status]);

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName(user)} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here&apos;s an overview of Shiv Furniture Works operations.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={15} />
          {error} — showing placeholder data.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? "—"}
          icon={Package}
          color="bg-indigo-50 text-indigo-600"
          href="/products"
        />
        <StatCard
          title="Customers"
          value={stats?.totalCustomers ?? "—"}
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
          href="/customers"
        />
        <StatCard
          title="Vendors"
          value={stats?.totalVendors ?? "—"}
          icon={Building2}
          color="bg-amber-50 text-amber-600"
          href="/vendors"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts ?? "—"}
          icon={AlertTriangle}
          color={
            stats && stats.lowStockProducts > 0
              ? "bg-red-50 text-red-600"
              : "bg-gray-50 text-gray-500"
          }
          href="/inventory"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Sales Orders"
          value={stats?.totalSalesOrders ?? "—"}
          icon={ShoppingCart}
          color="bg-blue-50 text-blue-600"
          href="/sales"
        />
        <StatCard
          title="Purchase Orders"
          value={stats?.totalPurchaseOrders ?? "—"}
          icon={Truck}
          color="bg-violet-50 text-violet-600"
          href="/purchases"
        />
        <StatCard
          title="Manufacturing Orders"
          value={stats?.totalManufacturingOrders ?? "—"}
          icon={Factory}
          color="bg-rose-50 text-rose-600"
          href="/manufacturing"
        />
      </div>

      {/* Inventory Value */}
      {stats && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-100">
                Total Inventory Value
              </p>
              <p className="text-3xl font-bold">
                ₹{(stats.inventoryValue ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-indigo-200 text-sm">
            <TrendingUp size={14} />
            Based on current on-hand quantities × cost price
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Sales Order", href: "/sales", icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
            { label: "New Purchase Order", href: "/purchases", icon: Truck, color: "text-violet-600 bg-violet-50" },
            { label: "New Manufacturing Order", href: "/manufacturing", icon: Factory, color: "text-rose-600 bg-rose-50" },
            { label: "Add Product", href: "/products", icon: Package, color: "text-indigo-600 bg-indigo-50" },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all text-center"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium text-gray-700 leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
