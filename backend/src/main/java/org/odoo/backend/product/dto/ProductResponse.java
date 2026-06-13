package org.odoo.backend.product.dto;



import lombok.*;
import org.odoo.backend.product.model.ProcurementType;
import org.odoo.backend.product.model.ProductType;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private UUID id;

    private String productCode;

    private String name;

    private String description;

    private BigDecimal salesPrice;

    private BigDecimal costPrice;

    private BigDecimal onHandQty;

    private BigDecimal reservedQty;

    private ProductType productType;

    private ProcurementType procurementType;

    private boolean procureOnDemand;

    private UUID vendorId;
}