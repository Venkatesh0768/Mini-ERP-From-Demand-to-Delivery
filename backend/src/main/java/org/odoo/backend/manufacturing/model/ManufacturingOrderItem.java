package org.odoo.backend.manufacturing.model;


import jakarta.persistence.*;
import lombok.*;
import org.odoo.backend.product.model.Product;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "manufacturing_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturing_order_id")
    private ManufacturingOrder manufacturingOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_product_id")
    private Product componentProduct;

    @Column(nullable = false)
    private BigDecimal requiredQuantity;

    @Builder.Default
    private BigDecimal consumedQuantity = BigDecimal.ZERO;
}