package org.odoo.backend.sales.repositories;


import org.odoo.backend.sales.model.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SalesOrderItemRepository
        extends JpaRepository<SalesOrderItem, UUID> {
}