package org.odoo.backend.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.AdminCreateUserRequest;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.auth.dto.AssignRolesRequest;
import org.odoo.backend.auth.dto.UserDTO;
import org.odoo.backend.auth.service.AdminUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Admin", description = "Administration endpoints — requires ROLE_ADMIN")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminUserService adminUserService;

    @Operation(summary = "Get all users (paginated)")
    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(adminUserService.getAllUsers(pageable));
    }

    @Operation(summary = "Admin creates a new user and sends an activation email")
    @PostMapping("/users")
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse(true, "User found", adminUserService.getUserById(id)));
    }

    @Operation(summary = "Assign roles to a user (replaces existing roles)")
    @PatchMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse> assignRoles(
            @PathVariable UUID id,
            @RequestBody AssignRolesRequest request) {
        return ResponseEntity.ok(adminUserService.assignRoles(id, request));
    }

    @Operation(summary = "Enable or disable user account")
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse> setStatus(
            @PathVariable UUID id,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(adminUserService.setUserStatus(id, enabled));
    }

    @Operation(summary = "Ban a user account")
    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse> banUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.setUserStatus(id, false));
    }

    @Operation(summary = "Delete a user account")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.deleteUser(id));
    }

    @Operation(summary = "Get dashboard stats")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats() {
        return ResponseEntity.ok(new ApiResponse(true, "Stats", adminUserService.getDashboardStats()));
    }
}
