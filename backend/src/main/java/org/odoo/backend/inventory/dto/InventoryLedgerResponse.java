package org.odoo.backend.inventory.dto;


import lombok.Builder;
import lombok.Data;
import org.odoo.backend.inventory.model.InventoryTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InventoryLedgerResponse {

    private UUID id;

    private UUID productId;

    private String productName;

    private InventoryTransactionType transactionType;

    private BigDecimal quantity;

    private BigDecimal balanceAfterTransaction;

    private String referenceNumber;

    private String remarks;

    private LocalDateTime createdAt;
}