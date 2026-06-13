package org.odoo.backend.audit.controller;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.audit.model.AuditEntityType;
import org.odoo.backend.audit.service.AuditService;
import org.odoo.backend.auth.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllLogs() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Audit logs fetched successfully",
                        auditService.getAllLogs()
                ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getLogsByUser(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "User audit logs fetched successfully",
                        auditService.getLogsByUser(userId)
                ));
    }

    @GetMapping("/entity/{entityType}")
    public ResponseEntity<ApiResponse> getLogsByEntityType(
            @PathVariable AuditEntityType entityType) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Entity audit logs fetched successfully",
                        auditService.getLogsByEntityType(entityType)
                ));
    }
}