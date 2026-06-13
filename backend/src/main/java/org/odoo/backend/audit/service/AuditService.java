package org.odoo.backend.audit.service;


import org.odoo.backend.audit.dto.AuditLogResponse;
import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;

import java.util.List;
import java.util.UUID;

public interface AuditService {

    void log(AuditAction action, AuditEntityType entityType, String entityId, String entityName, String description);

    List<AuditLogResponse> getAllLogs();

    List<AuditLogResponse> getLogsByUser(UUID userId);

    List<AuditLogResponse> getLogsByEntityType(AuditEntityType entityType);
}