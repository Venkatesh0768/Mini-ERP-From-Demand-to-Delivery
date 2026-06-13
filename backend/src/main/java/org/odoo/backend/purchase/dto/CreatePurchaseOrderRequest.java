package org.odoo.backend.purchase.dto;



import lombok.Data;

import java.util.List;
import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreatePurchaseOrderRequest {

    private UUID vendorId;

    private List<PurchaseOrderItemRequest> items;
}