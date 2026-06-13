package org.odoo.backend.customer.dto;


import jakarta.validation.constraints.Email;
import lombok.Data;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateCustomerRequest {

    private String name;

    @Email(message = "Invalid email")
    private String email;

    private String phone;

    private String address;
}