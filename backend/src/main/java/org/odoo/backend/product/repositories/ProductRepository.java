package org.odoo.backend.product.repositories;


import org.odoo.backend.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByProductCode(String code);

    boolean existsByProductCode(String code);

    long countByOnHandQtyLessThan(BigDecimal qty);
}