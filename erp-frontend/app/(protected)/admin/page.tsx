"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Shield, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { adminApi, PageResponse, type UserDTO } from "@/lib/api/admin.api";
import { UserTable } from "@/components/admin/UserTable";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { AccessDenied } from "@/components/ui/AccessDenied";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function AdminPage() {
  const { user, status } = useAuth();
  const { checking, allowed } = useRouteGuard();

  const [pageData, setPageData] = useState<PageResponse<UserDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      setPageData((await adminApi.getAllUsers(p, 10)).data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isAdmin(user)) return; // useRouteGuard handles redirect
    fetchUsers(page);
  }, [status, user, page, fetchUsers]);

  const handleCreateSuccess = () => {
    setCreateSuccess("User created successfully. An activation email has been sent.");
    fetchUsers(page);
    setTimeout(() => setCreateSuccess(null), 5000);
  };

  if (checking) return <PageSpinner />;
  if (!allowed) return <AccessDenied />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={13} className="text-indigo-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Administration
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage users, assign roles, and control access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchUsers(page)}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={13} />
            Create User
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}
      {createSuccess && <Alert variant="success" message={createSuccess} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} className="text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Users
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {pageData?.totalElements ?? "—"}
          </p>
        </Card>
      </div>

      {/* User table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">User Directory</h2>
        </div>
        <div className="p-6">
          {loading && !pageData ? (
            <PageSpinner />
          ) : (
            <>
              <UserTable
                users={pageData?.content ?? []}
                onRefresh={() => fetchUsers(page)}
              />

              {pageData && pageData.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">
                  <p className="text-sm text-gray-500">
                    Page{" "}
                    <span className="font-medium text-gray-900">
                      {pageData.number + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                      {pageData.totalPages}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pageData.number === 0 || loading}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={
                        pageData.number >= pageData.totalPages - 1 || loading
                      }
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
