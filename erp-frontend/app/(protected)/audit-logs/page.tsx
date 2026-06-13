"use client";

import { useEffect, useState, useCallback } from "react";
import { ScrollText, Search, X, Filter } from "lucide-react";
import { auditLogsApi } from "@/lib/api/erp.api";
import type { AuditLog, AuditAction, AuditEntityType } from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string }> = {
  CREATE: { label: "Created", color: "bg-emerald-50 text-emerald-700" },
  UPDATE: { label: "Updated", color: "bg-blue-50 text-blue-700" },
  DELETE: { label: "Deleted", color: "bg-red-50 text-red-700" },
  LOGIN: { label: "Login", color: "bg-gray-100 text-gray-700" },
  LOGOUT: { label: "Logout", color: "bg-gray-100 text-gray-700" },
  APPROVE: { label: "Approved", color: "bg-violet-50 text-violet-700" },
  CANCEL: { label: "Cancelled", color: "bg-amber-50 text-amber-700" },
  RECEIVE: { label: "Received", color: "bg-teal-50 text-teal-700" },
  COMPLETE: { label: "Completed", color: "bg-indigo-50 text-indigo-700" },
};

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  USER: "User",
  PRODUCT: "Product",
  CUSTOMER: "Customer",
  VENDOR: "Vendor",
  SALES_ORDER: "Sales Order",
  PURCHASE_ORDER: "Purchase Order",
  BOM: "BOM",
  MANUFACTURING_ORDER: "Manufacturing Order",
  INVENTORY: "Inventory",
  STOCK_ADJUSTMENT: "Stock Adjustment",
};

export default function AuditLogsPage() {
  const { checking, allowed } = useRouteGuard();
  const { status } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const fetchAll = useCallback(() => {
    setLoading(true);
    auditLogsApi
      .getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, fetchAll]);

  const allActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
  const allEntities = Array.from(new Set(logs.map((l) => l.entityType).filter(Boolean)));

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityName?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || l.action === actionFilter;
    const matchEntity = entityFilter === "all" || l.entityType === entityFilter;
    return matchSearch && matchAction && matchEntity;
  });

  // Summary counts
  const createCount = logs.filter((l) => l.action === "CREATE").length;
  const updateCount = logs.filter((l) => l.action === "UPDATE").length;
  const deleteCount = logs.filter((l) => l.action === "DELETE").length;

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Complete change history and system activity" />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Logs", value: logs.length, color: "bg-white border-gray-200 text-gray-900" },
          { label: "Created", value: createCount, color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { label: "Updated", value: updateCount, color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Deleted", value: deleteCount, color: "bg-red-50 border-red-100 text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, entity, description…"
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20">
            <option value="all">All Actions</option>
            {allActions.map((a) => <option key={a} value={a}>{ACTION_CONFIG[a]?.label ?? a}</option>)}
          </select>
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20">
            <option value="all">All Modules</option>
            {allEntities.map((e) => <option key={e} value={e}>{ENTITY_LABELS[e] ?? e}</option>)}
          </select>
          {(actionFilter !== "all" || entityFilter !== "all" || search) && (
            <button onClick={() => { setActionFilter("all"); setEntityFilter("all"); setSearch(""); }}
              className="text-xs text-gray-500 hover:text-gray-800 underline">Reset</button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Showing {filtered.length} of {logs.length} records
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit logs found"
          description={search || actionFilter !== "all" || entityFilter !== "all" ? "Try adjusting your filters" : "System activity will be recorded here automatically"} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Module</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Record</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((l) => {
                  const actionConfig = ACTION_CONFIG[l.action];
                  return (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {l.createdAt
                          ? new Date(l.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{l.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {ENTITY_LABELS[l.entityType] ?? l.entityType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{l.entityName}</p>
                          {l.entityId && (
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{l.entityId.substring(0, 12)}…</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionConfig?.color ?? "bg-gray-100 text-gray-700"}`}>
                          {actionConfig?.label ?? l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 max-w-[280px] truncate" title={l.description}>
                          {l.description || "—"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
