package org.odoo.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {

    private long totalUsers;

    private long totalProducts;

    private long totalCustomers;

    private long totalVendors;

    private long totalSalesOrders;

    private long totalPurchaseOrders;

    private long totalManufacturingOrders;

    private long lowStockProducts;

    private BigDecimal inventoryValue;
}