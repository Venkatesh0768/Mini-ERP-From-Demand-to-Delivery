package org.odoo.backend.vendor.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VendorResponse {

    private UUID id;

    private String vendorCode;

    private String name;

    private String email;

    private String phone;

    private String address;
}