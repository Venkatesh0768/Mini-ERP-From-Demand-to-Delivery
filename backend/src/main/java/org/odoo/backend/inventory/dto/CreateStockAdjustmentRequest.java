package org.odoo.backend.inventory.dto;


import lombok.Data;
import org.odoo.backend.inventory.model.AdjustmentType;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateStockAdjustmentRequest {

    private UUID productId;

    private AdjustmentType adjustmentType;

    private BigDecimal quantity;

    private String reason;
}