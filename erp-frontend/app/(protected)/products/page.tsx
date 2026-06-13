"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  IndianRupee,
} from "lucide-react";
import { productsApi, vendorsApi } from "@/lib/api/erp.api";
import type { Product, Vendor, CreateProductRequest, ProductType, ProcurementType } from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "FINISHED_GOOD", label: "Finished Good" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "CONSUMABLE", label: "Consumable" },
];

const PROCUREMENT_TYPES: { value: ProcurementType; label: string }[] = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

const PRODUCT_TYPE_BADGE: Record<ProductType, string> = {
  FINISHED_GOOD: "bg-blue-50 text-blue-700",
  RAW_MATERIAL: "bg-emerald-50 text-emerald-700",
  CONSUMABLE: "bg-amber-50 text-amber-700",
};

const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  FINISHED_GOOD: "Finished Good",
  RAW_MATERIAL: "Raw Material",
  CONSUMABLE: "Consumable",
};

const EMPTY_FORM: CreateProductRequest = {
  name: "",
  description: "",
  salesPrice: 0,
  costPrice: 0,
  productType: "FINISHED_GOOD",
  procureOnDemand: false,
  procurementType: undefined,
  vendorId: undefined,
};

export default function ProductsPage() {
  const { checking, allowed } = useRouteGuard();
  const { user, status } = useAuth();
  const canEdit = isAdmin(user) || user?.roles.includes("ROLE_BUSINESS_OWNER");

  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductRequest>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    Promise.all([productsApi.getAll(), vendorsApi.getAll()])
      .then(([pRes, vRes]) => {
        const pData = pRes.data?.data ?? pRes.data;
        const vData = vRes.data?.data ?? vRes.data;
        setProducts(Array.isArray(pData) ? pData : []);
        setVendors(Array.isArray(vData) ? vData : []);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchProducts();
  }, [status, fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      salesPrice: p.salesPrice,
      costPrice: p.costPrice,
      productType: p.productType,
      procureOnDemand: p.procureOnDemand,
      procurementType: p.procurementType,
      vendorId: p.vendor?.id,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Product name is required");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, form);
      } else {
        await productsApi.create(form);
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message ?? "Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      setError("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        actions={
          canEdit ? (
            <Button onClick={openCreate} size="sm">
              <Plus size={14} />
              New Product
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
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

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            search ? "Try a different search term" : "Create your first product to get started"
          }
          action={
            canEdit && !search ? (
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} /> New Product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Sales Price
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Cost Price
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    On Hand
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Reserved
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Free to Use
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Procurement
                  </th>
                  {canEdit && (
                    <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const freeToUse = (p.onHandQty ?? 0) - (p.reservedQty ?? 0);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.productCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            PRODUCT_TYPE_BADGE[p.productType] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {PRODUCT_TYPE_LABEL[p.productType] ?? p.productType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        <span className="flex items-center justify-end gap-0.5">
                          <IndianRupee size={11} className="text-gray-400" />
                          {Number(p.salesPrice ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        <span className="flex items-center justify-end gap-0.5">
                          <IndianRupee size={11} className="text-gray-400" />
                          {Number(p.costPrice ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {Number(p.onHandQty ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600">
                        {Number(p.reservedQty ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            freeToUse <= 0
                              ? "text-red-600 font-semibold"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          {freeToUse.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.procureOnDemand ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {p.procurementType ?? "—"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProduct ? "Edit Product" : "New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="error">{formError}</Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Product Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Wooden Table"
                required
              />
            </div>
            <Input
              label="Sales Price (₹)"
              type="number"
              min={0}
              step="0.01"
              value={form.salesPrice}
              onChange={(e) =>
                setForm({ ...form, salesPrice: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              min={0}
              step="0.01"
              value={form.costPrice}
              onChange={(e) =>
                setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Product Type
              </label>
              <select
                value={form.productType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productType: e.target.value as ProductType,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Procurement */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="procureOnDemand"
              checked={form.procureOnDemand}
              onChange={(e) =>
                setForm({ ...form, procureOnDemand: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="procureOnDemand"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Procure on Demand (auto-trigger procurement when stock is low)
            </label>
          </div>

          {form.procureOnDemand && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Procurement Type *
                </label>
                <select
                  value={form.procurementType ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      procurementType: e.target.value as ProcurementType,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select type…</option>
                  {PROCUREMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.procurementType === "PURCHASE" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Vendor
                  </label>
                  <select
                    value={form.vendorId ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, vendorId: e.target.value || undefined })
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select vendor…</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={formLoading}>
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
