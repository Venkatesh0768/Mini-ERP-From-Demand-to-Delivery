package org.odoo.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.auth.dto.AdminCreateUserRequest;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.auth.dto.AssignRolesRequest;
import org.odoo.backend.auth.dto.UserDTO;
import org.odoo.backend.auth.exception.EmailAlreadyExistsException;
import org.odoo.backend.auth.exception.UserNotFoundException;
import org.odoo.backend.auth.model.ActivationToken;
import org.odoo.backend.auth.model.Role;
import org.odoo.backend.auth.model.RoleType;
import org.odoo.backend.auth.model.User;
import org.odoo.backend.auth.repository.RoleRepository;
import org.odoo.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthService authService;
    private final ActivationTokenService activationTokenService;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Admin creates a new user account:
     * 1. Validates email uniqueness
     * 2. Creates a disabled, unverified user with the requested roles
     * 3. Generates an activation token
     * 4. Sends an activation email with a set-password link
     *
     * The user's account stays disabled until they follow the link and set a password.
     */
    @Transactional
    public ApiResponse createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("A user with that email already exists");
        }

        // Resolve roles
        Set<Role> roles = resolveRoles(request.getRoles());

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .position(request.getPosition() != null ? request.getPosition().trim() : null)
                .emailVerified(false)
                .enabled(false)
                .provider("local")
                .roles(roles)
                .build();

        userRepository.save(user);
        log.info("Admin created user: {}", user.getEmail());

        // Generate activation token and send email
        ActivationToken activationToken = activationTokenService.createToken(user.getEmail());
        String activationUrl = frontendUrl + "/activate-account?token=" + activationToken.getToken();
        emailService.sendActivationEmail(user.getEmail(), user.getFirstName(), activationUrl);

        log.info("Activation email sent to: {}", user.getEmail());
        return new ApiResponse(true, "User created and activation email sent to " + user.getEmail(),
                authService.convertToUserDTO(user));
    }

    /**
     * Return paginated list of all users (lightweight DTOs).
     */
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(authService::convertToUserDTO);
    }

    /**
     * Find a single user by ID.
     */
    public UserDTO getUserById(UUID id) {
        return userRepository.findById(id)
                .map(authService::convertToUserDTO)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }


    @Transactional
    public ApiResponse assignRoles(UUID userId, AssignRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Set<Role> newRoles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            RoleType roleType;
            try {
                roleType = RoleType.valueOf(roleName);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + roleName +
                        ". Valid roles: ROLE_USER, ROLE_ADMIN, ROLE_VENDOR");
            }
            Role role = roleRepository.findByName(roleType)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            newRoles.add(role);
        }

        // Safety: prevent removing themselves as last admin
        boolean wasAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        boolean stillAdmin = newRoles.stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);

        if (wasAdmin && !stillAdmin) {
            long adminCount = userRepository.countByRoleName(RoleType.ROLE_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot remove the last ADMIN from the system");
            }
        }

        user.setRoles(newRoles);
        userRepository.save(user);
        log.info("Roles updated for user={} → {}", user.getEmail(), request.getRoles());

        return new ApiResponse(true, "Roles updated successfully", authService.convertToUserDTO(user));
    }

    /**
     * Enable or disable a user account.
     */
    @Transactional
    public ApiResponse setUserStatus(UUID userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setEnabled(enabled);
        userRepository.save(user);
        String status = enabled ? "enabled" : "disabled";
        log.info("User {} account {}", user.getEmail(), status);

        return new ApiResponse(true, "User account " + status, authService.convertToUserDTO(user));
    }

    /**
     * Soft delete: disable account.
     */
    @Transactional
    public ApiResponse deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Safety: can't delete last admin
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        if (isAdmin) {
            long adminCount = userRepository.countByRoleName(RoleType.ROLE_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last ADMIN from the system");
            }
        }

        user.setEnabled(false);
        userRepository.save(user);
        return new ApiResponse(true, "User disabled (soft deleted)", null);
    }

    /**
     * Admin global stats for dashboard.
     */
    public java.util.Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long enabledUsers = userRepository.countByEnabledTrue();
        long adminCount = userRepository.countByRoleName(RoleType.ROLE_ADMIN);

        return java.util.Map.of(
                "totalUsers", totalUsers,
                "enabledUsers", enabledUsers,
                "adminCount", adminCount
        );
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            RoleType roleType;
            try {
                roleType = RoleType.valueOf(roleName);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + roleName +
                        ". Valid roles: " + java.util.Arrays.toString(RoleType.values()));
            }
            Role role = roleRepository.findByName(roleType)
                    .orElseThrow(() -> new RuntimeException("Role not found in DB: " + roleName));
            roles.add(role);
        }
        return roles;
    }
}
