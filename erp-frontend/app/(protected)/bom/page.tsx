"use client";

import { useEffect, useState, useCallback } from "react";
import { Layers, Plus, Eye, Trash2, Search, X } from "lucide-react";
import { bomsApi, productsApi } from "@/lib/api/erp.api";
import type { BOM, Product, CreateBOMRequest } from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { canApi } from "@/lib/utils/accessibleApis";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

export default function BomPage() {
  const { checking, allowed } = useRouteGuard();
  const { user, status } = useAuth();
  const canEdit =
    isAdmin(user) ||
    user?.roles.includes("ROLE_BUSINESS_OWNER") ||
    user?.roles.includes("ROLE_MANUFACTURING_USER");

  const [boms, setBoms] = useState<BOM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateBOMRequest>({
    finishedProductId: "",
    quantityProduced: 1,
    components: [],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewBom, setViewBom] = useState<BOM | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BOM | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    // MANUFACTURING_USER can access /boms but NOT /products (ADMIN/OWNER/INVENTORY only).
    // Skip product fetch for roles that can't read them.
    const productCall = canApi.readProducts(user) ? productsApi.getAll() : Promise.resolve(null);
    Promise.all([bomsApi.getAll(), productCall])
      .then(([bRes, pRes]) => {
        const bData = (bRes as { data: { data?: unknown } }).data?.data ?? (bRes as { data: unknown }).data;
        const pData = pRes ? (pRes as { data: { data?: unknown } }).data?.data ?? (pRes as { data: unknown }).data : [];
        setBoms(Array.isArray(bData) ? bData as BOM[] : []);
        setProducts(Array.isArray(pData) ? pData as Product[] : []);
      })
      .catch(() => setError("Failed to load BOMs"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, fetchAll]);

  const openCreate = () => {
    setForm({ finishedProductId: "", quantityProduced: 1, components: [{ componentProductId: "", requiredQuantity: 1 }] });
    setFormError(null);
    setCreateOpen(true);
  };

  const addComponent = () =>
    setForm((f) => ({ ...f, components: [...f.components, { componentProductId: "", requiredQuantity: 1 }] }));

  const removeComponent = (i: number) =>
    setForm((f) => ({ ...f, components: f.components.filter((_, idx) => idx !== i) }));

  const updateComponent = (i: number, field: "componentProductId" | "requiredQuantity", value: string | number) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.finishedProductId) { setFormError("Please select a finished product"); return; }
    if (form.components.length === 0 || form.components.some((c) => !c.componentProductId)) {
      setFormError("Please add at least one component");
      return;
    }
    setFormLoading(true); setFormError(null);
    try {
      await bomsApi.create(form);
      setCreateOpen(false);
      fetchAll();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message ?? "Failed to create BOM");
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { await bomsApi.delete(deleteTarget.id); setDeleteTarget(null); fetchAll(); }
    catch { setError("Failed to delete BOM"); }
    finally { setDeleteLoading(false); }
  };

  const filtered = boms.filter(
    (b) =>
      b.finishedProductName?.toLowerCase().includes(search.toLowerCase()) ||
      b.bomCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Only finished goods can be a BOM target
  const finishedGoods = products.filter((p) => p.productType === "FINISHED_GOOD");

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Bill of Materials"
        subtitle="Define components and quantities required to manufacture each product"
        actions={canEdit ? <Button onClick={openCreate} size="sm"><Plus size={14} /> New BOM</Button> : undefined}
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or BOM code…"
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" />
        {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Layers} title="No BOMs found"
          description={search ? "Try a different search term" : "Create a Bill of Materials to enable manufacturing"}
          action={canEdit && !search ? <Button size="sm" onClick={openCreate}><Plus size={14} /> New BOM</Button> : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.finishedProductName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{b.bomCode}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewBom(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View BOM"><Eye size={13} /></button>
                  {canEdit && <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete BOM"><Trash2 size={13} /></button>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  Produces: <span className="font-semibold text-gray-700">{b.quantityProduced}</span> units
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  <span className="font-semibold text-gray-700">{b.components?.length ?? 0}</span> components
                </span>
              </div>
              <div className="space-y-1">
                {b.components?.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">{c.componentProductName}</span>
                    <span className="font-medium text-gray-800 shrink-0 ml-2">× {c.requiredQuantity}</span>
                  </div>
                ))}
                {(b.components?.length ?? 0) > 3 && (
                  <p className="text-xs text-gray-400">+{(b.components?.length ?? 0) - 3} more…</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Bill of Materials" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Finished Product *</label>
              <select value={form.finishedProductId} onChange={(e) => setForm({ ...form, finishedProductId: e.target.value })}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" required>
                <option value="">Select product…</option>
                {finishedGoods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Quantity Produced *</label>
              <input type="number" min={1} step="0.01" value={form.quantityProduced}
                onChange={(e) => setForm({ ...form, quantityProduced: parseFloat(e.target.value) || 1 })}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Components *</label>
              <button type="button" onClick={addComponent} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"><Plus size={12} /> Add component</button>
            </div>
            <div className="space-y-2">
              {form.components.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select value={comp.componentProductId} onChange={(e) => updateComponent(idx, "componentProductId", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select component product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.productType.replace(/_/g, " ")})</option>)}
                  </select>
                  <input type="number" min={0.01} step="0.01" value={comp.requiredQuantity}
                    onChange={(e) => updateComponent(idx, "requiredQuantity", parseFloat(e.target.value) || 1)}
                    className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Qty" />
                  {form.components.length > 1 && (
                    <button type="button" onClick={() => removeComponent(idx)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={formLoading}>Create BOM</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewBom && (
        <Modal open={!!viewBom} onClose={() => setViewBom(null)} title={`BOM — ${viewBom.bomCode}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Finished Product</span><p className="font-semibold text-gray-900">{viewBom.finishedProductName}</p></div>
              <div><span className="text-gray-500">Quantity Produced</span><p className="font-semibold text-gray-900">{viewBom.quantityProduced} units</p></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Components ({viewBom.components?.length ?? 0})</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">#</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Component</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Required Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewBom.components?.map((c, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{c.componentProductName}</td>
                        <td className="px-3 py-2 text-right font-semibold">{c.requiredQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete BOM" message={`Delete BOM for "${deleteTarget?.finishedProductName}"? Manufacturing orders using this BOM may be affected.`}
        confirmLabel="Delete" loading={deleteLoading} />
    </div>
  );
}
