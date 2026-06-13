package org.odoo.backend.sales.service;


import org.odoo.backend.sales.dto.CreateSalesOrderRequest;
import org.odoo.backend.sales.dto.SalesOrderResponse;

import java.util.List;
import java.util.UUID;

public interface SalesOrderService {

    SalesOrderResponse createSalesOrder(CreateSalesOrderRequest request);

    SalesOrderResponse getSalesOrder(UUID id);

    List<SalesOrderResponse> getAllSalesOrders();

    SalesOrderResponse confirmOrder(UUID orderId);

    SalesOrderResponse cancelOrder(UUID orderId);
}