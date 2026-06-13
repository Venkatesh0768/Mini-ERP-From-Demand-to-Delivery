package org.odoo.backend.manufacturing.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.odoo.backend.bom.model.BOM;
import org.odoo.backend.product.model.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "manufacturing_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id")
    private BOM bom;

    @Column(nullable = false)
    private BigDecimal quantityToProduce;

    @Enumerated(EnumType.STRING)
    private ManufacturingOrderStatus status;

    @OneToMany(
            mappedBy = "manufacturingOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ManufacturingOrderItem> items =
            new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}