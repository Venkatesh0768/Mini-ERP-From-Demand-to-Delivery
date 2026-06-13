package org.odoo.backend.audit.service.impl;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.audit.dto.AuditLogResponse;
import org.odoo.backend.audit.model.*;
import org.odoo.backend.audit.repositories.AuditLogRepository;
import org.odoo.backend.audit.service.AuditService;
import org.odoo.backend.auth.model.User;
import org.odoo.backend.auth.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl
        implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void log(
            AuditAction action,
            AuditEntityType entityType,
            String entityId,
            String entityName,
            String description) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        AuditLog log =
                AuditLog.builder()
                        .userId(
                                user != null
                                        ? user.getId()
                                        : null)
                        .userEmail(email)
                        .action(action)
                        .entityType(entityType)
                        .entityId(entityId)
                        .entityName(entityName)
                        .description(description)
                        .build();

        auditLogRepository.save(log);
    }

    @Override
    public List<AuditLogResponse>
    getAllLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse>
    getLogsByUser(UUID userId) {

        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse>
    getLogsByEntityType(
            AuditEntityType entityType) {

        return auditLogRepository
                .findByEntityTypeOrderByCreatedAtDesc(
                        entityType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(
            AuditLog log) {

        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userEmail(log.getUserEmail())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .description(log.getDescription())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}