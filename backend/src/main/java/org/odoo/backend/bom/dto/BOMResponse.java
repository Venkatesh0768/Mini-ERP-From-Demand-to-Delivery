package org.odoo.backend.bom.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BOMResponse {

    private UUID id;

    private String bomCode;

    private UUID finishedProductId;

    private String finishedProductName;

    private BigDecimal quantityProduced;

    private List<BOMComponentResponse> components;
}