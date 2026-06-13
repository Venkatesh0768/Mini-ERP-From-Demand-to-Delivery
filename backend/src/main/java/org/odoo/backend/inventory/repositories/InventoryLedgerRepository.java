package org.odoo.backend.inventory.repositories;

import org.odoo.backend.inventory.model.InventoryLedger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryLedgerRepository extends JpaRepository<InventoryLedger, UUID> {
    List<InventoryLedger> findByProductIdOrderByCreatedAtDesc(UUID productId);
}