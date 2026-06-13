"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Truck, Factory, Package, Users, Building2,
  AlertTriangle, IndianRupee, TrendingUp, Clock,
} from "lucide-react";
import {
  dashboardApi, salesOrdersApi, purchaseOrdersApi,
  manufacturingOrdersApi, productsApi,
} from "@/lib/api/erp.api";
import type {
  DashboardStats, SalesOrder, PurchaseOrder, ManufacturingOrder,
} from "@/types/erp.types";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { displayName } from "@/lib/utils/roles";
import { canApi } from "@/lib/utils/accessibleApis";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

// ─── helpers ─────────────────────────────────────────────────────────────────

function extract<T>(res: unknown): T[] {
  const r = res as { data: { data?: unknown } };
  const d = r.data?.data ?? (res as { data: unknown }).data;
  return Array.isArray(d) ? (d as T[]) : [];
}

// ─── StatusBadge chip ─────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  count: number;
  active: boolean;
  color: string;
  onClick: () => void;
}

function Chip({ label, count, active, color, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[80px] px-3 py-2 rounded-xl border-2 text-center transition-all select-none ${
        active
          ? `${color} border-current shadow-md scale-105`
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className={`text-xl font-bold leading-none ${active ? "" : "text-gray-800"}`}>
        {count}
      </span>
      <span className="text-[10px] font-medium mt-1 leading-tight whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// ─── OrderSection ─────────────────────────────────────────────────────────────

interface OrderRow {
  label: string;
  count: number;
  key: string;
  color: string;
}

interface OrderSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  href: string;
  allRows: OrderRow[];
  myRows: OrderRow[];
  activeKey: string | null;
  onChipClick: (key: string) => void;
}

function OrderSection({
  title, icon: Icon, iconColor, href, allRows, myRows, activeKey, onChipClick,
}: OrderSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${iconColor} bg-opacity-5`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconColor}`}>
            <Icon size={18} />
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        <Link
          href={href}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* All row */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">
            All
          </p>
          <div className="flex flex-wrap gap-2">
            {allRows.map((r) => (
              <Chip
                key={r.key}
                label={r.label}
                count={r.count}
                active={activeKey === r.key}
                color={r.color}
                onClick={() => onChipClick(r.key)}
              />
            ))}
          </div>
        </div>

        {/* My row */}
        {myRows.some((r) => r.count > 0) && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">
              My orders
            </p>
            <div className="flex flex-wrap gap-2">
              {myRows.filter((r) => r.count > 0).map((r) => (
                <Chip
                  key={`my-${r.key}`}
                  label={r.label}
                  count={r.count}
                  active={activeKey === `my-${r.key}`}
                  color={r.color}
                  onClick={() => onChipClick(`my-${r.key}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { checking, allowed } = useRouteGuard();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [mfgOrders, setMfgOrders] = useState<ManufacturingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Active chip per section
  const [salesActive, setSalesActive] = useState<string | null>(null);
  const [purchaseActive, setPurchaseActive] = useState<string | null>(null);
  const [mfgActive, setMfgActive] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    if (!user) return;
    setLoading(true);

    const statsCall = canApi.readDashboard(user)
      ? dashboardApi.getStats()
      : Promise.resolve(null);

    const salesCall = canApi.readSales(user)
      ? salesOrdersApi.getAll()
      : Promise.resolve(null);

    const purchaseCall = canApi.readPurchases(user)
      ? purchaseOrdersApi.getAll()
      : Promise.resolve(null);

    const mfgCall = canApi.readMfg(user)
      ? manufacturingOrdersApi.getAll()
      : Promise.resolve(null);

    Promise.all([statsCall, salesCall, purchaseCall, mfgCall])
      .then(([sRes, soRes, poRes, moRes]) => {
        if (sRes) {
          const d = (sRes as { data: { data?: unknown } }).data?.data ?? (sRes as { data: unknown }).data;
          setStats(d as DashboardStats);
        }
        if (soRes) setSalesOrders(extract<SalesOrder>(soRes));
        if (poRes) setPurchaseOrders(extract<PurchaseOrder>(poRes));
        if (moRes) setMfgOrders(extract<ManufacturingOrder>(moRes));
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, fetchAll]);

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  // ── Compute Sales Order counts ──────────────────────────────────────────────
  const userEmail = user?.email ?? "";

  const soCount = (status: string) =>
    salesOrders.filter((o) => o.status === status).length;
  const soMyCount = (status: string) =>
    salesOrders.filter((o) => o.status === status && (o as unknown as { createdByEmail?: string }).createdByEmail === userEmail).length;

  // Partially delivered = CONFIRMED with some deliveries but not all
  const soPartial = salesOrders.filter(
    (o) => o.status === "PARTIALLY_DELIVERED"
  ).length;
  const soMyPartial = salesOrders.filter(
    (o) => o.status === "PARTIALLY_DELIVERED" &&
      (o as unknown as { createdByEmail?: string }).createdByEmail === userEmail
  ).length;

  const SALES_CHIP_COLOR = "bg-blue-100 text-blue-700 border-blue-400";
  const salesAllRows: OrderRow[] = [
    { key: "DRAFT",                label: "Draft",              count: soCount("DRAFT"),             color: SALES_CHIP_COLOR },
    { key: "CONFIRMED",            label: "Confirmed",          count: soCount("CONFIRMED"),          color: SALES_CHIP_COLOR },
    { key: "PARTIALLY_DELIVERED",  label: "Partially Delivered",count: soPartial,                    color: "bg-amber-100 text-amber-700 border-amber-400" },
    { key: "DELIVERED",            label: "Delivered",          count: soCount("DELIVERED"),          color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
    { key: "CANCELLED",            label: "Cancelled",          count: soCount("CANCELLED"),          color: "bg-red-100 text-red-700 border-red-400" },
  ].filter((r) => r.count > 0 || ["DRAFT","CONFIRMED"].includes(r.key));

  const salesMyRows: OrderRow[] = [
    { key: "DRAFT",               label: "Draft",              count: soMyCount("DRAFT"),    color: SALES_CHIP_COLOR },
    { key: "CONFIRMED",           label: "Confirmed",          count: soMyCount("CONFIRMED"), color: SALES_CHIP_COLOR },
    { key: "PARTIALLY_DELIVERED", label: "Partially Delivered",count: soMyPartial,            color: "bg-amber-100 text-amber-700 border-amber-400" },
    { key: "DELIVERED",           label: "Delivered",          count: soMyCount("DELIVERED"), color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
  ];

  // ── Compute Purchase Order counts ───────────────────────────────────────────
  const poCount = (s: string) => purchaseOrders.filter((o) => o.status === s).length;
  const poMyCount = (s: string) =>
    purchaseOrders.filter(
      (o) => o.status === s && (o as unknown as { createdByEmail?: string }).createdByEmail === userEmail
    ).length;

  const PURCHASE_CHIP_COLOR = "bg-violet-100 text-violet-700 border-violet-400";
  const purchaseAllRows: OrderRow[] = [
    { key: "DRAFT",     label: "Draft",             count: poCount("DRAFT"),     color: PURCHASE_CHIP_COLOR },
    { key: "CONFIRMED", label: "Confirmed",         count: poCount("CONFIRMED"), color: PURCHASE_CHIP_COLOR },
    { key: "RECEIVED",  label: "Received",          count: poCount("RECEIVED"),  color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
    { key: "CANCELLED", label: "Cancelled",         count: poCount("CANCELLED"), color: "bg-red-100 text-red-700 border-red-400" },
  ].filter((r) => r.count > 0 || ["DRAFT","CONFIRMED"].includes(r.key));

  const purchaseMyRows: OrderRow[] = [
    { key: "DRAFT",     label: "Draft",    count: poMyCount("DRAFT"),     color: PURCHASE_CHIP_COLOR },
    { key: "CONFIRMED", label: "Confirmed",count: poMyCount("CONFIRMED"), color: PURCHASE_CHIP_COLOR },
    { key: "RECEIVED",  label: "Received", count: poMyCount("RECEIVED"),  color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
  ];

  // ── Compute Manufacturing Order counts ──────────────────────────────────────
  const moCount = (s: string) => mfgOrders.filter((o) => o.status === s).length;
  const moMyCount = (s: string) =>
    mfgOrders.filter(
      (o) => o.status === s && (o as unknown as { createdByEmail?: string }).createdByEmail === userEmail
    ).length;

  const MFG_CHIP_COLOR = "bg-rose-100 text-rose-700 border-rose-400";
  const mfgAllRows: OrderRow[] = [
    { key: "DRAFT",       label: "Draft",       count: moCount("DRAFT"),        color: MFG_CHIP_COLOR },
    { key: "CONFIRMED",   label: "Confirmed",   count: moCount("CONFIRMED"),    color: MFG_CHIP_COLOR },
    { key: "IN_PROGRESS", label: "In Progress", count: moCount("IN_PROGRESS"),  color: "bg-amber-100 text-amber-700 border-amber-400" },
    { key: "COMPLETED",   label: "Completed",   count: moCount("COMPLETED"),    color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
    { key: "CANCELLED",   label: "Cancelled",   count: moCount("CANCELLED"),    color: "bg-red-100 text-red-700 border-red-400" },
  ].filter((r) => r.count > 0 || ["DRAFT","CONFIRMED"].includes(r.key));

  const mfgMyRows: OrderRow[] = [
    { key: "DRAFT",       label: "Draft",       count: moMyCount("DRAFT"),       color: MFG_CHIP_COLOR },
    { key: "CONFIRMED",   label: "Confirmed",   count: moMyCount("CONFIRMED"),   color: MFG_CHIP_COLOR },
    { key: "IN_PROGRESS", label: "In Progress", count: moMyCount("IN_PROGRESS"), color: "bg-amber-100 text-amber-700 border-amber-400" },
    { key: "COMPLETED",   label: "Completed",   count: moMyCount("COMPLETED"),   color: "bg-emerald-100 text-emerald-700 border-emerald-400" },
  ];

  // ── Summary stat cards ──────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      href: "/products",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? "—",
      icon: Users,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      href: "/customers",
    },
    {
      label: "Vendors",
      value: stats?.totalVendors ?? "—",
      icon: Building2,
      bg: "bg-amber-50",
      text: "text-amber-600",
      href: "/vendors",
    },
    {
      label: "Low Stock",
      value: stats?.lowStockProducts ?? "—",
      icon: AlertTriangle,
      bg: stats?.lowStockProducts ? "bg-red-50" : "bg-gray-50",
      text: stats?.lowStockProducts ? "text-red-600" : "text-gray-500",
      href: "/inventory",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Welcome ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back, {displayName(user)} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s a live snapshot of your operations.
        </p>
      </div>

      {/* ── Summary KPI strip ────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryCards.map(({ label, value, icon: Icon, bg, text, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${text}`}>
                  <Icon size={15} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </Link>
          ))}
        </div>
      )}

      {/* ── Inventory value banner ───────────────────────────────────────── */}
      {stats && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <IndianRupee size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-200">Total Inventory Value</p>
              <p className="text-2xl font-bold">
                ₹{(stats.inventoryValue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-indigo-200 text-sm">
            <TrendingUp size={14} />
            On-hand qty × cost price
          </div>
        </div>
      )}

      {/* ── Order Operations ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Operations Overview
        </h2>

        <div className="space-y-4">
          {/* Sales Orders */}
          {canApi.readSales(user) && (
            <OrderSection
              title="Sales Orders"
              icon={ShoppingCart}
              iconColor="bg-blue-50 text-blue-600"
              href="/sales"
              allRows={salesAllRows}
              myRows={salesMyRows}
              activeKey={salesActive}
              onChipClick={(k) => setSalesActive((prev) => (prev === k ? null : k))}
            />
          )}

          {/* Purchase Orders */}
          {canApi.readPurchases(user) && (
            <OrderSection
              title="Purchase Orders"
              icon={Truck}
              iconColor="bg-violet-50 text-violet-600"
              href="/purchases"
              allRows={purchaseAllRows}
              myRows={purchaseMyRows}
              activeKey={purchaseActive}
              onChipClick={(k) => setPurchaseActive((prev) => (prev === k ? null : k))}
            />
          )}

          {/* Manufacturing Orders */}
          {canApi.readMfg(user) && (
            <OrderSection
              title="Manufacturing Orders"
              icon={Factory}
              iconColor="bg-rose-50 text-rose-600"
              href="/manufacturing"
              allRows={mfgAllRows}
              myRows={mfgMyRows}
              activeKey={mfgActive}
              onChipClick={(k) => setMfgActive((prev) => (prev === k ? null : k))}
            />
          )}
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Sales Order",        href: "/sales",         icon: ShoppingCart, bg: "bg-blue-50",   text: "text-blue-600",   show: canApi.readSales(user) },
            { label: "New Purchase Order",     href: "/purchases",     icon: Truck,        bg: "bg-violet-50", text: "text-violet-600", show: canApi.readPurchases(user) },
            { label: "New Manufacturing Order",href: "/manufacturing", icon: Factory,      bg: "bg-rose-50",   text: "text-rose-600",   show: canApi.readMfg(user) },
            { label: "View Inventory",         href: "/inventory",     icon: Clock,        bg: "bg-indigo-50", text: "text-indigo-600", show: canApi.readInventory(user) },
          ]
            .filter((a) => a.show)
            .map(({ label, href, icon: Icon, bg, text }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2.5 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all text-center group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${text} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
