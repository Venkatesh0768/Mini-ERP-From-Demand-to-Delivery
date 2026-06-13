package org.odoo.backend.bom.dto;



import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateBOMRequest {

    private UUID finishedProductId;

    private BigDecimal quantityProduced;

    private List<BOMComponentRequest> components;
}