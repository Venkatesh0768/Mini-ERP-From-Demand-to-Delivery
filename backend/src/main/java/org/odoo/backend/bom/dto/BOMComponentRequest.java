package org.odoo.backend.bom.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BOMComponentRequest {

    private UUID componentProductId;

    private BigDecimal requiredQuantity;
}