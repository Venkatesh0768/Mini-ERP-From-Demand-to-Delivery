package org.odoo.backend.sales.repositories;

import org.odoo.backend.sales.model.SalesOrder;
import org.odoo.backend.sales.model.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalesOrderRepository
        extends JpaRepository<SalesOrder, UUID> {

    Optional<SalesOrder> findByOrderNumber(String orderNumber);

    List<SalesOrder> findByStatus(SalesOrderStatus status);
}