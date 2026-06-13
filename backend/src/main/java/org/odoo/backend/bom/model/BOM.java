package org.odoo.backend.bom.model;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.odoo.backend.product.model.Product;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "boms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BOM {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String bomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_product_id")
    private Product finishedProduct;

    @Column(nullable = false)
    private BigDecimal quantityProduced;

    @OneToMany(
            mappedBy = "bom",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BOMComponent> components =
            new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}