package org.odoo.backend.bom.repositories;

import org.odoo.backend.bom.model.BOM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BOMRepository extends JpaRepository<BOM, UUID> {

    Optional<BOM> findByBomCode(String bomCode);

    Optional<BOM> findByFinishedProductId(UUID productId);

    boolean existsByFinishedProductId(UUID productId);
}