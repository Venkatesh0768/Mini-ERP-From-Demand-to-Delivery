"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { vendorsApi } from "@/lib/api/erp.api";
import type { Vendor, CreateVendorRequest } from "@/types/erp.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AccessDenied } from "@/components/ui/AccessDenied";

const EMPTY_FORM: CreateVendorRequest = { name: "", email: "", phone: "", address: "" };

export default function VendorsPage() {
  const { checking, allowed } = useRouteGuard();
  const { user, status } = useAuth();
  const canEdit =
    isAdmin(user) ||
    user?.roles.includes("ROLE_BUSINESS_OWNER") ||
    user?.roles.includes("ROLE_PURCHASE_USER");

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<CreateVendorRequest>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    vendorsApi
      .getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setVendors(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load vendors"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAll();
  }, [status, fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    setForm({
      name: v.name,
      email: v.email ?? "",
      phone: v.phone ?? "",
      address: v.address ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError("Name and phone are required");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      editing
        ? await vendorsApi.update(editing.id, form)
        : await vendorsApi.create(form);
      setFormOpen(false);
      fetchAll();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message ?? "Failed to save vendor");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await vendorsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch {
      setError("Failed to delete vendor");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorCode?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setPage(0); }, [search]);

  const pageSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;
  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage your supplier directory"
        actions={
          canEdit ? (
            <Button onClick={openCreate} size="sm">
              <Plus size={14} /> New Vendor
            </Button>
          ) : undefined
        }
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors…"
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors found"
          description={search ? "Try a different search term" : "Add your first vendor"}
          action={
            canEdit && !search ? (
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} /> New Vendor
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Address</th>
                  {canEdit && (
                    <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageSlice.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{v.vendorCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {v.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={11} className="text-gray-400" /> {v.email}
                          </div>
                        )}
                        {v.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={11} className="text-gray-400" /> {v.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.address ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{v.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(v)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-3">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
            />
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Vendor" : "New Vendor"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Vendor / supplier name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="vendor@example.com"
          />
          <Input
            label="Phone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 XXXXXXXXXX"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              placeholder="Street, City, State, PIN"
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={formLoading}>
              {editing ? "Update" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
