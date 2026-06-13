package org.odoo.backend.manufacturing.repositories;

import org.odoo.backend.manufacturing.model.ManufacturingOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ManufacturingOrderItemRepository extends JpaRepository<ManufacturingOrderItem, UUID> {
}