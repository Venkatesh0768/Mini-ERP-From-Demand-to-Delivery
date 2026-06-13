"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Factory, Plus, Eye, CheckCircle, PlayCircle, XCircle,
  PackageCheck, Search, X, Pencil, Trash2,
} from "lucide-react";
import { manufacturingOrdersApi, productsApi, bomsApi } from "@/lib/api/erp.api";
import type {
  ManufacturingOrder, Product, CreateManufacturingOrderRequest,
  ManufacturingOrderStatus, BOM,
} from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { canApi } from "@/lib/utils/accessibleApis";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

type Tab = "all" | ManufacturingOrderStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

interface ComponentOverride {
  componentProductId: string;
  componentProductName: string;
  requiredQuantity: number;
}

export default function ManufacturingPage() {
  const { checking, allowed } = useRouteGuard();
  const { user, status } = useAuth();
  const canCreate =
    isAdmin(user) ||
    user?.roles.includes("ROLE_BUSINESS_OWNER") ||
    user?.roles.includes("ROLE_MANUFACTURING_USER");
  const canApprove = isAdmin(user) || user?.roles.includes("ROLE_BUSINESS_OWNER");

  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateManufacturingOrderRequest>({
    productId: "",
    quantityToProduce: 1,
  });
  const [selectedBom, setSelectedBom] = useState<BOM | null>(null);
  const [componentOverrides, setComponentOverrides] = useState<ComponentOverride[]>([]);
  const [bomLoading, setBomLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View / action
  const [viewOrder, setViewOrder] = useState<ManufacturingOrder | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    order: ManufacturingOrder;
    type: "confirm" | "start" | "complete" | "cancel";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    const productCall = canApi.readProducts(user) ? productsApi.getAll() : Promise.resolve(null);
    Promise.all([manufacturingOrdersApi.getAll(), productCall, bomsApi.getAll()])
      .then(([moRes, pRes, bRes]) => {
        const moData = (moRes as { data: { data?: unknown } }).data?.data ?? (moRes as { data: unknown }).data;
        const pData = pRes
          ? (pRes as { data: { data?: unknown } }).data?.data ?? (pRes as { data: unknown }).data
          : [];
        const bData = (bRes as { data: { data?: unknown } }).data?.data ?? (bRes as { data: unknown }).data;
        setOrders(Array.isArray(moData) ? (moData as ManufacturingOrder[]) : []);
        setProducts(Array.isArray(pData) ? (pData as Product[]) : []);
        setBoms(Array.isArray(bData) ? (bData as BOM[]) : []);
      })
      .catch(() => setError("Failed to load manufacturing orders"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, user, fetchAll]);

  // ─── When product is selected, auto-load its BOM ──────────────────────────
  const handleProductSelect = useCallback(
    (productId: string) => {
      setForm((f) => ({ ...f, productId }));
      setSelectedBom(null);
      setComponentOverrides([]);
      if (!productId) return;

      // First try from already-loaded boms list
      const bomFromCache = boms.find((b) => b.finishedProductId === productId);
      if (bomFromCache) {
        setSelectedBom(bomFromCache);
        setComponentOverrides(
          bomFromCache.components.map((c) => ({
            componentProductId: c.componentProductId,
            componentProductName: c.componentProductName,
            requiredQuantity: c.requiredQuantity,
          }))
        );
        return;
      }

      // Fallback: fetch all BOMs and filter
      setBomLoading(true);
      bomsApi
        .getAll()
        .then((res) => {
          const data = (res as { data: { data?: unknown } }).data?.data ?? (res as { data: unknown }).data;
          const all = Array.isArray(data) ? (data as BOM[]) : [];
          const found = all.find((b) => b.finishedProductId === productId) ?? null;
          setSelectedBom(found);
          if (found) {
            setComponentOverrides(
              found.components.map((c) => ({
                componentProductId: c.componentProductId,
                componentProductName: c.componentProductName,
                requiredQuantity: c.requiredQuantity,
              }))
            );
          }
        })
        .finally(() => setBomLoading(false));
    },
    [boms]
  );

  const openCreate = () => {
    setForm({ productId: "", quantityToProduce: 1 });
    setSelectedBom(null);
    setComponentOverrides([]);
    setFormError(null);
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) { setFormError("Please select a product"); return; }
    setFormLoading(true);
    setFormError(null);
    try {
      await manufacturingOrdersApi.create(form);
      setCreateOpen(false);
      fetchAll();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message ?? "Failed to create manufacturing order");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      switch (actionTarget.type) {
        case "confirm": await manufacturingOrdersApi.confirm(actionTarget.order.id); break;
        case "start":   await manufacturingOrdersApi.start(actionTarget.order.id);   break;
        case "complete": await manufacturingOrdersApi.complete(actionTarget.order.id); break;
        case "cancel":  await manufacturingOrdersApi.cancel(actionTarget.order.id);  break;
      }
      setActionTarget(null);
      fetchAll();
    } catch {
      setError(`Failed to ${actionTarget.type} manufacturing order`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchTab = tab === "all" || o.status === tab;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.productName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  useEffect(() => { setPage(0); }, [search, tab]);
  const pageSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const ACTION_CONFIG = {
    confirm:  { title: "Confirm Manufacturing Order", message: (o: ManufacturingOrder) => `Confirm MO ${o.orderNumber} for ${o.quantityToProduce} units of ${o.productName}?`, label: "Confirm", variant: "primary" as const },
    start:    { title: "Start Production", message: (o: ManufacturingOrder) => `Start production for MO ${o.orderNumber}? Components will be reserved.`, label: "Start Production", variant: "primary" as const },
    complete: { title: "Complete Manufacturing Order", message: (o: ManufacturingOrder) => `Mark MO ${o.orderNumber} as complete? Finished goods will be added to stock.`, label: "Mark Complete", variant: "primary" as const },
    cancel:   { title: "Cancel Manufacturing Order", message: (o: ManufacturingOrder) => `Cancel MO ${o.orderNumber}? This cannot be undone.`, label: "Cancel Order", variant: "danger" as const },
  };

  const finishedGoods = products.filter((p) => p.productType === "FINISHED_GOOD");

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Manufacturing Orders"
        subtitle="Track production from raw materials to finished goods"
        actions={canCreate ? <Button onClick={openCreate} size="sm"><Plus size={14} /> New Manufacturing Order</Button> : undefined}
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? orders.length : orders.filter((o) => o.status === key).length;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
              {count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === key ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by MO # or product…"
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" />
        {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Factory} title="No manufacturing orders found"
          description={search || tab !== "all" ? "Try adjusting your filters" : "Create your first manufacturing order"}
          action={canCreate && tab === "all" && !search ? <Button size="sm" onClick={openCreate}><Plus size={14} /> New MO</Button> : undefined} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">MO #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Qty to Produce</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Components</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageSlice.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{o.orderNumber}</span></td>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.productName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{o.quantityToProduce}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewOrder(o)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View details"><Eye size={13} /></button>
                        {canApprove && o.status === "DRAFT" && <button onClick={() => setActionTarget({ order: o, type: "confirm" })} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Confirm"><CheckCircle size={13} /></button>}
                        {o.status === "CONFIRMED" && <button onClick={() => setActionTarget({ order: o, type: "start" })} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Start production"><PlayCircle size={13} /></button>}
                        {o.status === "IN_PROGRESS" && <button onClick={() => setActionTarget({ order: o, type: "complete" })} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Mark complete"><PackageCheck size={13} /></button>}
                        {(o.status === "DRAFT" || o.status === "CONFIRMED") && <button onClick={() => setActionTarget({ order: o, type: "cancel" })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Cancel"><XCircle size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-3">
            <Pagination page={page} pageSize={pageSize} total={filtered.length}
              onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }} />
          </div>
        </div>
      )}

      {/* ── Create Modal with Editable BOM ──────────────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Manufacturing Order" size="xl">
        <form onSubmit={handleCreate} className="space-y-5">
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Finished Product *</label>
              <select
                value={form.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                <option value="">Select product…</option>
                {finishedGoods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Quantity to Produce *</label>
              <input
                type="number" min={1} step="1" value={form.quantityToProduce}
                onChange={(e) => setForm({ ...form, quantityToProduce: parseFloat(e.target.value) || 1 })}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* BOM Preview — shown once a product is selected */}
          {form.productId && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Bill of Materials</p>
                  {selectedBom ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      BOM <span className="font-mono">{selectedBom.bomCode}</span> · Produces {selectedBom.quantityProduced} unit(s) per run
                    </p>
                  ) : bomLoading ? (
                    <p className="text-xs text-gray-400 mt-0.5">Loading BOM…</p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ No BOM found for this product. Components will not be auto-populated.</p>
                  )}
                </div>
                {selectedBom && (
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                    {componentOverrides.length} component{componentOverrides.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {selectedBom && componentOverrides.length > 0 && (
                <div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Component</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">BOM Qty</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 w-36">Required for MO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {componentOverrides.map((comp, idx) => {
                        const bomQty = selectedBom.components[idx]?.requiredQuantity ?? comp.requiredQuantity;
                        const scaledDefault = (bomQty / (selectedBom.quantityProduced || 1)) * form.quantityToProduce;
                        return (
                          <tr key={comp.componentProductId} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{comp.componentProductName}</td>
                            <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{bomQty} / run</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-gray-400">(default {scaledDefault.toFixed(2)})</span>
                                <input
                                  type="number"
                                  min={0.01}
                                  step="0.01"
                                  value={comp.requiredQuantity}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0.01;
                                    setComponentOverrides((prev) =>
                                      prev.map((c, i) => i === idx ? { ...c, requiredQuantity: val } : c)
                                    );
                                  }}
                                  className="w-24 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-right outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="px-4 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                    ✏️ You can adjust component quantities above. Changes apply only to this manufacturing order.
                  </p>
                </div>
              )}

              {selectedBom && componentOverrides.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">This BOM has no components defined.</p>
              )}
            </div>
          )}

          {!form.productId && (
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              💡 Select a product to preview and customise its Bill of Materials before creating the order.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={formLoading}>Create MO</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewOrder && (
        <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Manufacturing Order — ${viewOrder.orderNumber}`} size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Product</span><p className="font-semibold text-gray-900">{viewOrder.productName}</p></div>
              <div><span className="text-gray-500">Qty to Produce</span><p className="font-semibold text-gray-900">{viewOrder.quantityToProduce}</p></div>
              <div><span className="text-gray-500">Status</span><div className="mt-1"><StatusBadge status={viewOrder.status} size="md" /></div></div>
              {viewOrder.bomId && <div><span className="text-gray-500">BOM</span><p className="font-medium text-gray-900 font-mono text-xs mt-1">{viewOrder.bomId}</p></div>}
            </div>
            {viewOrder.items && viewOrder.items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Components</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Component</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Required</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Consumed</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                    </tr></thead>
                    <tbody>
                      {viewOrder.items.map((item, idx) => {
                        const consumed = item.consumedQuantity ?? 0;
                        const required = item.requiredQuantity ?? 0;
                        const isDone = consumed >= required;
                        return (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-3 py-2 font-medium text-gray-900">{item.componentProductName}</td>
                            <td className="px-3 py-2 text-right">{required}</td>
                            <td className="px-3 py-2 text-right">{consumed}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDone ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                {isDone ? "Done" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
              {canApprove && viewOrder.status === "DRAFT" && <Button size="sm" onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "confirm" }); }}><CheckCircle size={14} /> Confirm</Button>}
              {viewOrder.status === "CONFIRMED" && <Button size="sm" onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "start" }); }}><PlayCircle size={14} /> Start Production</Button>}
              {viewOrder.status === "IN_PROGRESS" && <Button size="sm" onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "complete" }); }}><PackageCheck size={14} /> Mark Complete</Button>}
              {(viewOrder.status === "DRAFT" || viewOrder.status === "CONFIRMED") && <Button variant="danger" size="sm" onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "cancel" }); }}><XCircle size={14} /> Cancel</Button>}
            </div>
          </div>
        </Modal>
      )}

      {actionTarget && (
        <ConfirmDialog
          open={!!actionTarget} onClose={() => setActionTarget(null)} onConfirm={handleAction}
          title={ACTION_CONFIG[actionTarget.type].title}
          message={ACTION_CONFIG[actionTarget.type].message(actionTarget.order)}
          confirmLabel={ACTION_CONFIG[actionTarget.type].label}
          variant={ACTION_CONFIG[actionTarget.type].variant}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
