// ─── Product ────────────────────────────────────────────────────────────────

export type ProductType = "FINISHED_GOOD" | "RAW_MATERIAL" | "CONSUMABLE";
export type ProcurementType = "PURCHASE" | "MANUFACTURING";

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  salesPrice: number;
  costPrice: number;
  onHandQty: number;
  reservedQty: number;
  productType: ProductType;
  procureOnDemand: boolean;
  procurementType?: ProcurementType;
  vendor?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  salesPrice: number;
  costPrice: number;
  productType: ProductType;
  procureOnDemand: boolean;
  procurementType?: ProcurementType;
  vendorId?: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreateVendorRequest {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

// ─── Sales Orders ────────────────────────────────────────────────────────────

export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export interface SalesOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  deliveredQty: number;
  unitPrice: number;
  totalAmount: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: SalesOrderStatus;
  items: SalesOrderItem[];
  createdAt?: string;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  createdAt?: string;
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  items: { productId: string; quantity: number }[];
}

// ─── Bill of Materials ───────────────────────────────────────────────────────

export interface BOMComponent {
  id: string;
  componentProductId: string;
  componentProductName: string;
  requiredQuantity: number;
}

export interface BOM {
  id: string;
  bomCode: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityProduced: number;
  components: BOMComponent[];
  createdAt: string;
}

export interface CreateBOMRequest {
  finishedProductId: string;
  quantityProduced: number;
  components: { componentProductId: string; requiredQuantity: number }[];
}

// ─── Manufacturing Orders ────────────────────────────────────────────────────

export type ManufacturingOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface ManufacturingOrderItem {
  id: string;
  componentProductId: string;
  componentProductName: string;
  requiredQuantity: number;
  consumedQuantity: number;
}

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  bomId?: string;
  quantityToProduce: number;
  status: ManufacturingOrderStatus;
  items: ManufacturingOrderItem[];
  createdAt?: string;
}

export interface CreateManufacturingOrderRequest {
  productId: string;
  quantityToProduce: number;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type TransactionType =
  | "PURCHASE_RECEIPT"
  | "SALES_DELIVERY"
  | "MANUFACTURING_CONSUMPTION"
  | "MANUFACTURING_PRODUCTION"
  | "MANUAL_ADJUSTMENT";

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  transactionType: TransactionType;
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCustomers: number;
  totalVendors: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  totalManufacturingOrders: number;
  lowStockProducts: number;
  inventoryValue: number;
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "CANCEL"
  | "RECEIVE"
  | "COMPLETE"
  | "START"
  | "DELIVER";

export type AuditEntityType =
  | "USER"
  | "PRODUCT"
  | "CUSTOMER"
  | "VENDOR"
  | "SALES_ORDER"
  | "PURCHASE_ORDER"
  | "BOM"
  | "MANUFACTURING_ORDER"
  | "INVENTORY"
  | "STOCK_ADJUSTMENT";

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}
