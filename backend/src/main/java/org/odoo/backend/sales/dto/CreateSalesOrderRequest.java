package org.odoo.backend.sales.dto;



import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateSalesOrderRequest {

    @NotNull
    private UUID customerId;

    private List<SalesOrderItemRequest> items;
}