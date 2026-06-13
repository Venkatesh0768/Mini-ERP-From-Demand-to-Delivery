package org.odoo.backend.audit.dto;


import lombok.Builder;
import lombok.Data;
import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AuditLogResponse {

    private UUID id;

    private UUID userId;

    private String userEmail;

    private AuditAction action;

    private AuditEntityType entityType;

    private String entityId;

    private String entityName;

    private String description;

    private String ipAddress;

    private LocalDateTime createdAt;
}