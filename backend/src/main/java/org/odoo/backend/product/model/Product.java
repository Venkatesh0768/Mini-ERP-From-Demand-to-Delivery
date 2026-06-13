package org.odoo.backend.product.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.odoo.backend.vendor.model.Vendor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product  {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(updatable = false)
    private UUID createdBy;

    private UUID updatedBy;

    @Column(unique = true, nullable = false)
    private String productCode;

    @Column(nullable = false)
    private String name;

    private String description;

    private BigDecimal salesPrice;

    private BigDecimal costPrice;

    private BigDecimal onHandQty;

    private BigDecimal reservedQty;

    @Enumerated(EnumType.STRING)
    private ProductType productType;

    private boolean procureOnDemand;

    @Enumerated(EnumType.STRING)
    private ProcurementType procurementType;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
}