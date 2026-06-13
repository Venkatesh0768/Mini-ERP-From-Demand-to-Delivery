package org.odoo.backend.customer.dto;


import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CustomerResponse {

    private UUID id;

    private String customerCode;

    private String name;

    private String email;

    private String phone;

    private String address;
}