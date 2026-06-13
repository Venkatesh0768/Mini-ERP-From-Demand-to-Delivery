package org.odoo.backend.bom.repositories;

import org.odoo.backend.bom.model.BOMComponent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BOMComponentRepository extends JpaRepository<BOMComponent, UUID> {
}