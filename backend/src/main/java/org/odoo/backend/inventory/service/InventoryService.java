package org.odoo.backend.inventory.service;

import org.odoo.backend.inventory.dto.InventoryLedgerResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    List<InventoryLedgerResponse> getProductHistory(UUID productId);

    List<InventoryLedgerResponse> getAllTransactions();
}