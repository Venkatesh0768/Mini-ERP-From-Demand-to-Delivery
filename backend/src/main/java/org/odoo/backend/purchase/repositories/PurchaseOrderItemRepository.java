package org.odoo.backend.purchase.repositories;

import org.odoo.backend.purchase.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {
}