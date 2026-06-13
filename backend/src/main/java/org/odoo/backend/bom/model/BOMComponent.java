package org.odoo.backend.bom.model;

import jakarta.persistence.*;
import lombok.*;
import org.odoo.backend.product.model.Product;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "bom_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BOMComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id")
    private BOM bom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_product_id")
    private Product componentProduct;

    @Column(nullable = false)
    private BigDecimal requiredQuantity;
}