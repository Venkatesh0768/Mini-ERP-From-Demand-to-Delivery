package org.odoo.backend.sales.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalesOrderItemRequest {

    private UUID productId;

    private BigDecimal quantity;
}