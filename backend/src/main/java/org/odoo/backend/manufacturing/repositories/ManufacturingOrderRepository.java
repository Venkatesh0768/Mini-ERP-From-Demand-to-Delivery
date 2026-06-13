package org.odoo.backend.manufacturing.repositories;

import org.odoo.backend.manufacturing.model.ManufacturingOrder;
import org.odoo.backend.manufacturing.model.ManufacturingOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManufacturingOrderRepository extends JpaRepository<ManufacturingOrder, UUID> {

    Optional<ManufacturingOrder> findByOrderNumber(String orderNumber);

    List<ManufacturingOrder> findByStatus(ManufacturingOrderStatus status);
}