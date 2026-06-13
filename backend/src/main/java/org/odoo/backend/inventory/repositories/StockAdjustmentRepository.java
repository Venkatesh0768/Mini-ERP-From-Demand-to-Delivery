package org.odoo.backend.inventory.repositories;

import org.odoo.backend.inventory.model.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, UUID> {
}