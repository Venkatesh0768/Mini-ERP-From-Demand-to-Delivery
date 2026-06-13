package org.odoo.backend.purchase.dto;

import lombok.Builder;
import lombok.Data;
import org.odoo.backend.purchase.model.PurchaseOrderStatus;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PurchaseOrderResponse {

    private UUID id;

    private String orderNumber;

    private UUID vendorId;

    private String vendorName;

    private PurchaseOrderStatus status;

    private List<PurchaseOrderItemResponse> items;
}