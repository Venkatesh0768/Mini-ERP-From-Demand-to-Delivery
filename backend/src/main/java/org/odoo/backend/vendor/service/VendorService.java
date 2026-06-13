package org.odoo.backend.vendor.service;

import org.odoo.backend.vendor.dto.CreateVendorRequest;
import org.odoo.backend.vendor.dto.UpdateVendorRequest;
import org.odoo.backend.vendor.dto.VendorResponse;

import java.util.List;
import java.util.UUID;

public interface VendorService {

    VendorResponse createVendor(CreateVendorRequest request);

    VendorResponse getVendor(UUID vendorId);

    List<VendorResponse> getAllVendors();

    VendorResponse updateVendor(UUID vendorId,
                                UpdateVendorRequest request);

    void deleteVendor(UUID vendorId);
}