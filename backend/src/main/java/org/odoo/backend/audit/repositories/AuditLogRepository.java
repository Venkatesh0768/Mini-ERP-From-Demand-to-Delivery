package org.odoo.backend.audit.repositories;

import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;
import org.odoo.backend.audit.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(AuditEntityType entityType);

    List<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action);
}