"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  X,
  IndianRupee,
} from "lucide-react";
import { salesOrdersApi, customersApi, productsApi } from "@/lib/api/erp.api";
import type {
  SalesOrder,
  Customer,
  Product,
  CreateSalesOrderRequest,
  SalesOrderStatus,
} from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { canApi } from "@/lib/utils/accessibleApis";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

type Tab = "all" | SalesOrderStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PARTIALLY_DELIVERED", label: "Partial" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function SalesPage() {
  const { checking, allowed } = useRouteGuard();
  const { user, status } = useAuth();
  const canCreate =
    isAdmin(user) ||
    user?.roles.includes("ROLE_BUSINESS_OWNER") ||
    user?.roles.includes("ROLE_SALES_USER");
  const canApprove =
    isAdmin(user) || user?.roles.includes("ROLE_BUSINESS_OWNER");

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateSalesOrderRequest>({ customerId: "", items: [] });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View modal
  const [viewOrder, setViewOrder] = useState<SalesOrder | null>(null);

  // Confirm/Cancel
  const [actionTarget, setActionTarget] = useState<{ order: SalesOrder; type: "confirm" | "cancel" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    // SALES_USER can access /sales-orders and /customers but NOT /products (ADMIN/OWNER/INVENTORY only).
    // Conditionally fetch products only when the role permits; otherwise show manual entry.
    const calls: [Promise<unknown>, Promise<unknown>, Promise<unknown> | null] = [
      salesOrdersApi.getAll(),
      customersApi.getAll(),
      canApi.readProducts(user) ? productsApi.getAll() : null,
    ];
    Promise.all(
      calls.map((c) => (c ? c : Promise.resolve(null)))
    )
      .then(([soRes, cRes, pRes]) => {
        const soData = (soRes as { data: { data?: unknown } })?.data?.data ?? (soRes as { data: unknown })?.data;
        const cData = (cRes as { data: { data?: unknown } })?.data?.data ?? (cRes as { data: unknown })?.data;
        const pData = pRes ? (pRes as { data: { data?: unknown } })?.data?.data ?? (pRes as { data: unknown })?.data : [];
        setOrders(Array.isArray(soData) ? soData as SalesOrder[] : []);
        setCustomers(Array.isArray(cData) ? cData as Customer[] : []);
        setProducts(Array.isArray(pData) ? pData as Product[] : []);
      })
      .catch(() => setError("Failed to load sales orders"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, user, fetchAll]);

  const openCreate = () => {
    setForm({ customerId: "", items: [{ productId: "", quantity: 1 }] });
    setFormError(null);
    setCreateOpen(true);
  };

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { productId: "", quantity: 1 }] }));

  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateItem = (
    i: number,
    field: "productId" | "quantity",
    value: string | number
  ) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      ),
    }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { setFormError("Please select a customer"); return; }
    if (form.items.length === 0 || form.items.some((i) => !i.productId)) {
      setFormError("Please add at least one product");
      return;
    }
    setFormLoading(true); setFormError(null);
    try {
      await salesOrdersApi.create(form);
      setCreateOpen(false);
      fetchAll();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message ?? "Failed to create sales order");
    } finally { setFormLoading(false); }
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === "confirm") {
        await salesOrdersApi.confirm(actionTarget.order.id);
      } else {
        await salesOrdersApi.cancel(actionTarget.order.id);
      }
      setActionTarget(null);
      fetchAll();
    } catch {
      setError(`Failed to ${actionTarget.type} order`);
    } finally { setActionLoading(false); }
  };

  const filtered = orders.filter((o) => {
    const matchTab = tab === "all" || o.status === tab;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const getTotal = (o: SalesOrder) =>
    o.items?.reduce((sum, i) => sum + (i.totalAmount ?? 0), 0) ?? 0;

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        subtitle="Manage customer demand and deliveries"
        actions={
          canCreate ? (
            <Button onClick={openCreate} size="sm">
              <Plus size={14} /> New Sales Order
            </Button>
          ) : undefined
        }
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? orders.length : orders.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === key ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or customer…"
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart} title="No sales orders found"
          description={search || tab !== "all" ? "Try adjusting your filters" : "Create your first sales order"}
          action={canCreate && tab === "all" && !search ? <Button size="sm" onClick={openCreate}><Plus size={14} /> New Sales Order</Button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Items</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {o.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.customerName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-0.5 font-semibold text-gray-900">
                        <IndianRupee size={11} className="text-gray-400" />
                        {getTotal(o).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewOrder(o)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View details"
                        >
                          <Eye size={13} />
                        </button>
                        {canApprove && o.status === "DRAFT" && (
                          <button
                            onClick={() => setActionTarget({ order: o, type: "confirm" })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Confirm order"
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {o.status === "DRAFT" && (
                          <button
                            onClick={() => setActionTarget({ order: o, type: "cancel" })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Cancel order"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Sales Order" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Customer *</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Products *</label>
              <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                <Plus size={12} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => {
                const selectedProduct = products.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, "productId", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Free: {((p.onHandQty ?? 0) - (p.reservedQty ?? 0)).toFixed(0)})</option>
                      ))}
                    </select>
                    <input
                      type="number" min={1} step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Qty"
                    />
                    {selectedProduct && (
                      <span className="text-xs text-gray-500 w-24 text-right shrink-0">
                        ₹{(Number(selectedProduct.salesPrice ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    )}
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={formLoading}>Create Sales Order</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewOrder && (
        <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Sales Order — ${viewOrder.orderNumber}`} size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Customer</span>
                <p className="font-medium text-gray-900">{viewOrder.customerName}</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <div className="mt-1"><StatusBadge status={viewOrder.status} size="md" /></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Product</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Ordered</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Delivered</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items?.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{item.deliveredQty ?? 0}</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.unitPrice ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold">₹{Number(item.totalAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-100">
                      <td colSpan={4} className="px-3 py-2 text-sm font-semibold text-right text-gray-700">Grand Total</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-900">
                        ₹{getTotal(viewOrder).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {canApprove && viewOrder.status === "DRAFT" && (
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <Button
                  variant="danger" size="sm"
                  onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "cancel" }); }}
                >
                  <XCircle size={14} /> Cancel Order
                </Button>
                <Button
                  size="sm"
                  onClick={() => { setViewOrder(null); setActionTarget({ order: viewOrder, type: "confirm" }); }}
                >
                  <CheckCircle size={14} /> Confirm Order
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm action */}
      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        title={actionTarget?.type === "confirm" ? "Confirm Order" : "Cancel Order"}
        message={
          actionTarget?.type === "confirm"
            ? `Confirm order ${actionTarget?.order.orderNumber}? This will reserve stock and may trigger procurement.`
            : `Cancel order ${actionTarget?.order.orderNumber}? Reserved stock will be released.`
        }
        confirmLabel={actionTarget?.type === "confirm" ? "Confirm" : "Cancel Order"}
        variant={actionTarget?.type === "cancel" ? "danger" : "primary"}
        loading={actionLoading}
      />
    </div>
  );
}
