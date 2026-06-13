"use client";

import type {
  SalesOrderStatus,
  PurchaseOrderStatus,
  ManufacturingOrderStatus,
} from "@/types/erp.types";

type AnyStatus =
  | SalesOrderStatus
  | PurchaseOrderStatus
  | ManufacturingOrderStatus
  | string;

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  // Sales
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-50 text-blue-700" },
  PARTIALLY_DELIVERED: {
    label: "Partial",
    className: "bg-amber-50 text-amber-700",
  },
  DELIVERED: { label: "Delivered", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700" },
  // Purchase
  RECEIVED: { label: "Received", className: "bg-emerald-50 text-emerald-700" },
  // Manufacturing
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-violet-50 text-violet-700",
  },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${config.className}`}
    >
      {config.label}
    </span>
  );
}
