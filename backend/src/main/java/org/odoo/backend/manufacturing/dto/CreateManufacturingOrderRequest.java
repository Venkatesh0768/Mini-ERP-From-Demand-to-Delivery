package org.odoo.backend.manufacturing.dto;


import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateManufacturingOrderRequest {

    private UUID productId;

    private BigDecimal quantityToProduce;
    }
