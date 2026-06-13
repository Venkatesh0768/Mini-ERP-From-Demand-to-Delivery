package org.odoo.backend.purchase.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PurchaseOrderItemRequest {

    private UUID productId;

    private BigDecimal quantity;
}
