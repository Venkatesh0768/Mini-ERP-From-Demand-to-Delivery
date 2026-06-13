package org.odoo.backend.manufacturing.service;


import org.odoo.backend.manufacturing.dto.CreateManufacturingOrderRequest;
import org.odoo.backend.manufacturing.dto.ManufacturingOrderResponse;

import java.util.List;
import java.util.UUID;

public interface ManufacturingService {

    ManufacturingOrderResponse createManufacturingOrder(CreateManufacturingOrderRequest request);

    ManufacturingOrderResponse getManufacturingOrder(UUID id);

    List<ManufacturingOrderResponse> getAllManufacturingOrders();

    ManufacturingOrderResponse confirmOrder(UUID orderId);

    ManufacturingOrderResponse startProduction(UUID orderId);

    ManufacturingOrderResponse completeOrder(UUID orderId);

    ManufacturingOrderResponse cancelOrder(UUID orderId);
}