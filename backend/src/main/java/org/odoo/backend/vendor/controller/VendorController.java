package org.odoo.backend.vendor.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.vendor.dto.CreateVendorRequest;
import org.odoo.backend.vendor.dto.UpdateVendorRequest;
import org.odoo.backend.vendor.service.VendorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<ApiResponse> createVendor(@Valid @RequestBody CreateVendorRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Vendor created successfully",
                        vendorService.createVendor(request)
                ));
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse> getVendor(
            @PathVariable UUID vendorId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Vendor fetched successfully",
                        vendorService.getVendor(vendorId)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllVendors() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Vendor list fetched successfully",
                        vendorService.getAllVendors()
                ));
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<ApiResponse> updateVendor(@PathVariable UUID vendorId, @Valid @RequestBody UpdateVendorRequest request) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Vendor updated successfully",
                        vendorService.updateVendor(vendorId, request)
                ));
    }

    @DeleteMapping("/{vendorId}")
    public ResponseEntity<ApiResponse> deleteVendor(@PathVariable UUID vendorId) {
        vendorService.deleteVendor(vendorId);
        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Vendor deleted successfully",
                        null
                ));
    }
}