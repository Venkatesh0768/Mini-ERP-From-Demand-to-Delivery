package org.odoo.backend.inventory.repositories;

import org.odoo.backend.inventory.model.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, UUID> {
    Optional<StockAdjustment> findByAdjustmentNumber(String adjustmentNumber);
}
