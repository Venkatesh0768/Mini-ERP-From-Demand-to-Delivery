package org.odoo.backend.purchase.dto;



import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PurchaseOrderItemResponse {

    private UUID productId;

    private String productName;

    private BigDecimal orderedQty;

    private BigDecimal receivedQty;

    private BigDecimal unitCost;

    private BigDecimal totalCost;
}