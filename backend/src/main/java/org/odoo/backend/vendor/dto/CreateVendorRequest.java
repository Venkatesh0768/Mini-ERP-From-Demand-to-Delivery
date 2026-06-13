package org.odoo.backend.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateVendorRequest {

    @NotBlank(message = "Vendor name is required")
    private String name;

    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String address;
}