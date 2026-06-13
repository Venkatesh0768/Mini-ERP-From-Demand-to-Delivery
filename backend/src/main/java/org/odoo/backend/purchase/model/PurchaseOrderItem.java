package org.odoo.backend.purchase.model;


import jakarta.persistence.*;
import lombok.*;
import org.odoo.backend.product.model.Product;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private BigDecimal orderedQty;

    @Builder.Default
    private BigDecimal receivedQty = BigDecimal.ZERO;

    private BigDecimal unitCost;

    private BigDecimal totalCost;
}