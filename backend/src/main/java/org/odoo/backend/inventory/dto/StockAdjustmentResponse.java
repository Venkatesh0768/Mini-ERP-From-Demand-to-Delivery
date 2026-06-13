package org.odoo.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;
import org.odoo.backend.inventory.model.AdjustmentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class StockAdjustmentResponse {

    private UUID id;

    private String adjustmentNumber;

    private UUID productId;

    private String productName;

    private AdjustmentType adjustmentType;

    private BigDecimal quantity;

    private String reason;

    private LocalDateTime createdAt;
}