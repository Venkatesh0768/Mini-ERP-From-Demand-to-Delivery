package org.odoo.backend.bom.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BOMComponentRequest {

    private UUID componentProductId;

    private BigDecimal requiredQuantity;
}