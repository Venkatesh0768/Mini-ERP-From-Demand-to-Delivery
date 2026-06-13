package org.odoo.backend.sales.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class SalesOrderItemResponse {

    private UUID productId;

    private String productName;

    private BigDecimal quantity;

    private BigDecimal deliveredQty;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;
}