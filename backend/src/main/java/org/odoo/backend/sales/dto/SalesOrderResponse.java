package org.odoo.backend.sales.dto;


import lombok.Builder;
import lombok.Data;
import org.odoo.backend.sales.model.SalesOrderStatus;

import java.util.List;
import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalesOrderResponse {

    private UUID id;

    private String orderNumber;

    private UUID customerId;

    private String customerName;

    private SalesOrderStatus status;

    private List<SalesOrderItemResponse> items;
}