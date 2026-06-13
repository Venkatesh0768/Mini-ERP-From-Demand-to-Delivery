import apiClient from "./client";
import type { ApiResponse } from "@/types/auth.types";
import type { AxiosResponse } from "axios";

// ─── Backend UserDTO shape ────────────────────────────────────────────────────
// Matches org.odoo.backend.auth.dto.UserDTO exactly.
// roles is Set<String> on the Java side — arrives as string[] in JSON.
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  enabled: boolean;
  provider: string;
  profileImageUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  roles: string[]; // e.g. ["ROLE_ADMIN", "ROLE_SALES_USER"]
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
}

// Request shapes — must match backend exactly
export interface AdminCreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[]; // Set<String> on the backend
}

export interface AssignRolesPayload {
  roles: string[]; // Set<String> on the backend
}

export const adminApi = {
  // Returns Spring Page<UserDTO> directly (not wrapped in ApiResponse)
  getAllUsers: (
    page = 0,
    size = 20,
    sort = "createdAt,desc"
  ): Promise<AxiosResponse<PageResponse<UserDTO>>> =>
    apiClient.get("/admin/users", { params: { page, size, sort } }),

  getUserById: (id: string): Promise<AxiosResponse<ApiResponse<UserDTO>>> =>
    apiClient.get(`/admin/users/${id}`),

  createUser: (
    data: AdminCreateUserPayload
  ): Promise<AxiosResponse<ApiResponse<UserDTO>>> =>
    apiClient.post("/admin/users", data),

  assignRoles: (
    id: string,
    data: AssignRolesPayload
  ): Promise<AxiosResponse<ApiResponse<UserDTO>>> =>
    apiClient.patch(`/admin/users/${id}/roles`, data),

  setUserStatus: (
    id: string,
    enabled: boolean
  ): Promise<AxiosResponse<ApiResponse<UserDTO>>> =>
    apiClient.patch(`/admin/users/${id}/status`, null, { params: { enabled } }),

  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.delete(`/admin/users/${id}`),

  getStats: (): Promise<AxiosResponse<ApiResponse>> =>
    apiClient.get("/admin/stats"),
};
