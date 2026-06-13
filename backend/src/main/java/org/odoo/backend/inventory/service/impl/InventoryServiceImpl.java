package org.odoo.backend.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.inventory.dto.InventoryLedgerResponse;
import org.odoo.backend.inventory.model.InventoryLedger;
import org.odoo.backend.inventory.repositories.InventoryLedgerRepository;
import org.odoo.backend.inventory.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryServiceImpl
        implements InventoryService {

    private final InventoryLedgerRepository
            inventoryLedgerRepository;

    @Override
    public List<InventoryLedgerResponse> getProductHistory(UUID productId) {

        return inventoryLedgerRepository
                .findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<InventoryLedgerResponse>
    getAllTransactions() {

        return inventoryLedgerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InventoryLedgerResponse
    mapToResponse(InventoryLedger ledger) {

        return InventoryLedgerResponse.builder()
                .id(ledger.getId())
                .productId(ledger.getProduct().getId())
                .productName(ledger.getProduct().getName())
                .transactionType(
                        ledger.getTransactionType())
                .quantity(ledger.getQuantity())
                .balanceAfterTransaction(
                        ledger.getBalanceAfterTransaction())
                .referenceNumber(
                        ledger.getReferenceNumber())
                .remarks(ledger.getRemarks())
                .createdAt(ledger.getCreatedAt())
                .build();
    }
}