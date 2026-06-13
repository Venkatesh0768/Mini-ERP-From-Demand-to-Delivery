package org.odoo.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Request body for the admin "Create User" endpoint.
 * The user receives an activation email — no password is set at creation time.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2–50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be 2–50 characters")
    private String lastName;

    /** Optional job title / position. */
    private String position;

    /**
     * Role names to assign (e.g. "ROLE_USER", "ROLE_SALES_USER").
     * Must not be empty — every created user needs at least one role.
     */
    @NotEmpty(message = "At least one role must be assigned")
    private Set<String> roles;
}
