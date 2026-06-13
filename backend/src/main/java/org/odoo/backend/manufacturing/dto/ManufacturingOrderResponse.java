package org.odoo.backend.manufacturing.dto;


import lombok.Builder;
import lombok.Data;
import org.odoo.backend.manufacturing.model.ManufacturingOrderStatus;


import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ManufacturingOrderResponse {

    private UUID id;

    private String orderNumber;

    private UUID productId;

    private String productName;

    private BigDecimal quantityToProduce;

    private ManufacturingOrderStatus status;

    private List<ManufacturingOrderItemResponse> items;
}