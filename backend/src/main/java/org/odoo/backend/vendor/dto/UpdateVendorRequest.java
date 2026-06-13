package org.odoo.backend.vendor.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateVendorRequest {

    private String name;

    @Email(message = "Invalid email")
    private String email;

    private String phone;

    private String address;
}