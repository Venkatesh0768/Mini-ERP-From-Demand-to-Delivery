package org.odoo.backend.sales.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SalesOrderItemRequest {

    private UUID productId;

    private BigDecimal quantity;
}