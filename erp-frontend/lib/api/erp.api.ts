import apiClient from "./client";
import type {
  CreateBOMRequest,
  CreateCustomerRequest,
  CreateManufacturingOrderRequest,
  CreateProductRequest,
  CreatePurchaseOrderRequest,
  CreateSalesOrderRequest,
  CreateVendorRequest,
} from "@/types/erp.types";

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: () => apiClient.get("/products"),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: CreateProductRequest) => apiClient.post("/products", data),
  update: (id: string, data: Partial<CreateProductRequest>) =>
    apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

// ─── Customers ───────────────────────────────────────────────────────────────

export const customersApi = {
  getAll: () => apiClient.get("/customers"),
  getById: (id: string) => apiClient.get(`/customers/${id}`),
  create: (data: CreateCustomerRequest) => apiClient.post("/customers", data),
  update: (id: string, data: Partial<CreateCustomerRequest>) =>
    apiClient.put(`/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
};

// ─── Vendors ─────────────────────────────────────────────────────────────────

export const vendorsApi = {
  getAll: () => apiClient.get("/vendors"),
  getById: (id: string) => apiClient.get(`/vendors/${id}`),
  create: (data: CreateVendorRequest) => apiClient.post("/vendors", data),
  update: (id: string, data: Partial<CreateVendorRequest>) =>
    apiClient.put(`/vendors/${id}`, data),
  delete: (id: string) => apiClient.delete(`/vendors/${id}`),
};

// ─── Sales Orders ─────────────────────────────────────────────────────────────

export const salesOrdersApi = {
  getAll: () => apiClient.get("/sales-orders"),
  getById: (id: string) => apiClient.get(`/sales-orders/${id}`),
  create: (data: CreateSalesOrderRequest) =>
    apiClient.post("/sales-orders", data),
  confirm: (id: string) => apiClient.put(`/sales-orders/${id}/confirm`),
  cancel: (id: string) => apiClient.put(`/sales-orders/${id}/cancel`),
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const purchaseOrdersApi = {
  getAll: () => apiClient.get("/purchase-orders"),
  getById: (id: string) => apiClient.get(`/purchase-orders/${id}`),
  create: (data: CreatePurchaseOrderRequest) =>
    apiClient.post("/purchase-orders", data),
  confirm: (id: string) => apiClient.put(`/purchase-orders/${id}/confirm`),
  receive: (id: string) => apiClient.put(`/purchase-orders/${id}/receive`),
  cancel: (id: string) => apiClient.put(`/purchase-orders/${id}/cancel`),
};

// ─── Manufacturing Orders ─────────────────────────────────────────────────────

export const manufacturingOrdersApi = {
  getAll: () => apiClient.get("/manufacturing-orders"),
  getById: (id: string) => apiClient.get(`/manufacturing-orders/${id}`),
  create: (data: CreateManufacturingOrderRequest) =>
    apiClient.post("/manufacturing-orders", data),
  confirm: (id: string) => apiClient.put(`/manufacturing-orders/${id}/confirm`),
  start: (id: string) => apiClient.put(`/manufacturing-orders/${id}/start`),
  complete: (id: string) => apiClient.put(`/manufacturing-orders/${id}/complete`),
  cancel: (id: string) => apiClient.put(`/manufacturing-orders/${id}/cancel`),
};

// ─── Bill of Materials ────────────────────────────────────────────────────────

export const bomsApi = {
  getAll: () => apiClient.get("/boms"),
  getById: (id: string) => apiClient.get(`/boms/${id}`),
  create: (data: CreateBOMRequest) => apiClient.post("/boms", data),
  delete: (id: string) => apiClient.delete(`/boms/${id}`),
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventoryApi = {
  getAllTransactions: () => apiClient.get("/inventory/transactions"),
  getProductHistory: (productId: string) =>
    apiClient.get(`/inventory/product/${productId}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => apiClient.get("/dashboard"),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogsApi = {
  getAll: () => apiClient.get("/audit-logs"),
  getByUser: (userId: string) => apiClient.get(`/audit-logs/user/${userId}`),
  getByEntityType: (entityType: string) =>
    apiClient.get(`/audit-logs/entity/${entityType}`),
};
