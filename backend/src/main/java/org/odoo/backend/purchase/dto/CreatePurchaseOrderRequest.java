package org.odoo.backend.purchase.dto;



import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreatePurchaseOrderRequest {

    private UUID vendorId;

    private List<PurchaseOrderItemRequest> items;
}