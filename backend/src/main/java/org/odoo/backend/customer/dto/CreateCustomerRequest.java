package org.odoo.backend.customer.dto;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateCustomerRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String address;
}