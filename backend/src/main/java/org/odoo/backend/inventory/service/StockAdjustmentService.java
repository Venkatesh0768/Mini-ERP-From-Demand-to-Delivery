package org.odoo.backend.inventory.service;

import org.odoo.backend.inventory.dto.CreateStockAdjustmentRequest;
import org.odoo.backend.inventory.dto.StockAdjustmentResponse;

import java.util.List;
import java.util.UUID;

public interface StockAdjustmentService {

    StockAdjustmentResponse createAdjustment(CreateStockAdjustmentRequest request);

    StockAdjustmentResponse getAdjustment(UUID id);

    List<StockAdjustmentResponse> getAllAdjustments();
}