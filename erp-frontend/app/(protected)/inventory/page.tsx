"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Warehouse,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
} from "lucide-react";
import { inventoryApi, productsApi } from "@/lib/api/erp.api";
import type { InventoryTransaction, Product } from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

const TRANSACTION_LABELS: Record<
  string,
  { label: string; color: string; positive: boolean }
> = {
  PURCHASE_RECEIPT: {
    label: "Purchase Receipt",
    color: "bg-emerald-50 text-emerald-700",
    positive: true,
  },
  SALES_DELIVERY: {
    label: "Sales Delivery",
    color: "bg-blue-50 text-blue-700",
    positive: false,
  },
  MANUFACTURING_CONSUMPTION: {
    label: "MFG Consumption",
    color: "bg-orange-50 text-orange-700",
    positive: false,
  },
  MANUFACTURING_PRODUCTION: {
    label: "MFG Production",
    color: "bg-violet-50 text-violet-700",
    positive: true,
  },
  MANUAL_ADJUSTMENT: {
    label: "Manual Adjustment",
    color: "bg-gray-100 text-gray-700",
    positive: true,
  },
};

const PAGE_SIZE = 15;

type ActiveTab = "snapshot" | "ledger";

export default function InventoryPage() {
  const { checking, allowed } = useRouteGuard();
  const { status } = useAuth();

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Tab & pagination
  const [tab, setTab] = useState<ActiveTab>("snapshot");
  const [ledgerPage, setLedgerPage] = useState(0);
  const [snapshotPage, setSnapshotPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      inventoryApi.getAllTransactions(),
      productsApi.getAll(),
    ])
      .then(([txRes, pRes]) => {
        const txData = txRes.data?.data ?? txRes.data;
        const pData = pRes.data?.data ?? pRes.data;
        setTransactions(Array.isArray(txData) ? txData : []);
        setProducts(Array.isArray(pData) ? pData : []);
      })
      .catch(() => setError("Failed to load inventory data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, fetchAll]);

  // ─── Ledger filters ───────────────────────────────────────────────────────
  const allTypes = Array.from(
    new Set(transactions.map((t) => t.transactionType).filter(Boolean))
  );

  const filteredLedger = transactions.filter((t) => {
    const matchSearch =
      t.productName?.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceId?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.transactionType === typeFilter;
    return matchSearch && matchType;
  });

  // ─── Snapshot filters ─────────────────────────────────────────────────────
  const filteredSnapshot = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Summary stats ────────────────────────────────────────────────────────
  const inbound = transactions
    .filter((t) => TRANSACTION_LABELS[t.transactionType]?.positive)
    .reduce((s, t) => s + (t.quantity ?? 0), 0);
  const outbound = transactions
    .filter((t) => !TRANSACTION_LABELS[t.transactionType]?.positive)
    .reduce((s, t) => s + Math.abs(t.quantity ?? 0), 0);
  const lowStock = products.filter(
    (p) => (p.onHandQty ?? 0) - (p.reservedQty ?? 0) <= 0
  ).length;

  // ─── Pagination slices ────────────────────────────────────────────────────
  const ledgerSlice = filteredLedger.slice(
    ledgerPage * pageSize,
    (ledgerPage + 1) * pageSize
  );
  const snapshotSlice = filteredSnapshot.slice(
    snapshotPage * pageSize,
    (snapshotPage + 1) * pageSize
  );

  // Reset page on filter change
  useEffect(() => { setLedgerPage(0); }, [search, typeFilter]);
  useEffect(() => { setSnapshotPage(0); }, [search]);

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  const tabBtn = (t: ActiveTab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        tab === t
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Stock snapshot and complete movement history"
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} className="text-amber-600" />
            <p className="text-xs text-amber-700">Zero / Negative Stock</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{lowStock}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-emerald-600" />
            <p className="text-xs text-emerald-700">Total Inbound</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">+{inbound.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={13} className="text-red-600" />
            <p className="text-xs text-red-700">Total Outbound</p>
          </div>
          <p className="text-2xl font-bold text-red-700">-{outbound.toFixed(2)}</p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        {tabBtn("snapshot", "📦 Stock Snapshot")}
        {tabBtn("ledger", "📋 Movement Ledger")}
      </div>

      {/* ── Shared Search + Ledger Type Filter ──────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "snapshot"
                ? "Search product or code…"
                : "Search product or reference…"
            }
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {tab === "ledger" && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          >
            <option value="all">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {TRANSACTION_LABELS[t]?.label ?? t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Stock Snapshot Tab ────────────────────────────────────────────── */}
      {tab === "snapshot" && (
        <>
          {filteredSnapshot.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description={
                search
                  ? "Try a different search term"
                  : "No products have been created yet"
              }
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Type</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">On Hand</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Reserved</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Free to Use</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {snapshotSlice.map((p) => {
                      const free = (p.onHandQty ?? 0) - (p.reservedQty ?? 0);
                      const isLow = free <= 0;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.productCode}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {p.productType.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {Number(p.onHandQty ?? 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-600">
                            {Number(p.reservedQty ?? 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold ${isLow ? "text-red-600" : "text-emerald-600"}`}>
                              {free.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isLow
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isLow ? "⚠ Low Stock" : "In Stock"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-3">
                <Pagination
                  page={snapshotPage}
                  pageSize={pageSize}
                  total={filteredSnapshot.length}
                  onPageChange={setSnapshotPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Movement Ledger Tab ───────────────────────────────────────────── */}
      {tab === "ledger" && (
        <>
          {filteredLedger.length === 0 ? (
            <EmptyState
              icon={Warehouse}
              title="No transactions found"
              description={
                search || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Inventory movements will appear here as orders are processed"
              }
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date & Time</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Type</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ledgerSlice.map((t) => {
                      const config = TRANSACTION_LABELS[t.transactionType];
                      const qty = t.quantity ?? 0;
                      const isPositive = config?.positive ?? qty > 0;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{t.productName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                config?.color ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {config?.label ?? t.transactionType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-semibold ${
                                isPositive ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {isPositive ? "+" : "-"}
                              {Math.abs(qty).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {t.referenceId ? (
                              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {t.referenceType ?? ""} {t.referenceId.substring(0, 8)}…
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-3">
                <Pagination
                  page={ledgerPage}
                  pageSize={pageSize}
                  total={filteredLedger.length}
                  onPageChange={setLedgerPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
