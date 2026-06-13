package org.odoo.backend.purchase.service;

import org.odoo.backend.purchase.dto.CreatePurchaseOrderRequest;
import org.odoo.backend.purchase.dto.PurchaseOrderResponse;

import java.util.List;
import java.util.UUID;

public interface PurchaseOrderService {

    PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request);

    PurchaseOrderResponse getPurchaseOrder(UUID orderId);

    List<PurchaseOrderResponse> getAllPurchaseOrders();

    PurchaseOrderResponse confirmOrder(UUID orderId);

    PurchaseOrderResponse receiveOrder(UUID orderId);

    PurchaseOrderResponse cancelOrder(UUID orderId);
}