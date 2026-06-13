package org.odoo.backend.purchase.repositories;

import org.odoo.backend.purchase.model.PurchaseOrder;
import org.odoo.backend.purchase.model.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, UUID> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    long count();
}