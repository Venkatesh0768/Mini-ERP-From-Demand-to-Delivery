"use client";

import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { adminApi } from "@/lib/api/admin.api";
import { ALL_ROLES, roleLabel } from "@/lib/utils/roles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { RoleType } from "@/types/auth.types";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  position: "",
};

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [form, setForm]         = useState(INITIAL_FORM);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>(["ROLE_USER"]);
  const [errors, setErrors]     = useState<Partial<typeof INITIAL_FORM & { roles: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const set = (field: keyof typeof INITIAL_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const toggleRole = (role: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    if (errors.roles) setErrors((er) => ({ ...er, roles: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!selectedRoles.length)  e.roles     = "Select at least one role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    setLoading(true);
    try {
      await adminApi.createUser({
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        position: form.position.trim() || undefined,
        roles: selectedRoles,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(
        isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to create user.")
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <UserPlus size={15} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create User</h2>
              <p className="text-xs text-gray-500 mt-0.5">An activation email will be sent automatically.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          <Alert variant="error" message={apiError} />

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              placeholder="Jane"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
              disabled={loading}
              autoFocus
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={form.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <Input
            label="Email address"
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            disabled={loading}
          />

          {/* Position (optional) */}
          <Input
            label="Position (optional)"
            placeholder="e.g. Sales Manager"
            value={form.position}
            onChange={set("position")}
            disabled={loading}
          />

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                    selectedRoles.includes(role)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {roleLabel(role)}
                </button>
              ))}
            </div>
            {errors.roles && (
              <p className="mt-1.5 text-xs text-red-600">{errors.roles}</p>
            )}
          </div>

          {/* Activation note */}
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
            <p className="text-xs text-indigo-700 leading-relaxed">
              <span className="font-semibold">What happens next:</span> The user will receive an email
              with a secure link to set their password and activate their account.
              The link expires in <span className="font-semibold">72 hours</span>.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} onClick={handleSubmit}>
            {loading ? (
              <><Loader2 size={13} className="animate-spin" /> Creating…</>
            ) : (
              <><UserPlus size={13} /> Create & Send Invite</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
