package org.odoo.backend.manufacturing.dto;

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
public class ManufacturingOrderItemResponse {

    private UUID componentProductId;

    private String componentProductName;

    private BigDecimal requiredQuantity;

    private BigDecimal consumedQuantity;
}