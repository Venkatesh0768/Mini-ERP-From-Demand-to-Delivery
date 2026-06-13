package org.odoo.backend.vendor.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendorResponse {

    private UUID id;

    private String vendorCode;

    private String name;

    private String email;

    private String phone;

    private String address;
}