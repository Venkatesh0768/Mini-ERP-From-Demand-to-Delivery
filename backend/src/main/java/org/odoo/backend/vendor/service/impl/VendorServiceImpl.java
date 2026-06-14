package org.odoo.backend.vendor.service.impl;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.vendor.dto.CreateVendorRequest;
import org.odoo.backend.vendor.dto.UpdateVendorRequest;
import org.odoo.backend.vendor.dto.VendorResponse;
import org.odoo.backend.vendor.model.Vendor;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.odoo.backend.vendor.service.VendorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final org.odoo.backend.audit.service.AuditService auditService;

    @Override
    @CacheEvict(value = "vendors", allEntries = true)
    public VendorResponse createVendor(CreateVendorRequest request) {

        Vendor vendor = Vendor.builder()
                .vendorCode(generateVendorCode())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        Vendor savedVendor =
                vendorRepository.save(vendor);
        auditService.log(org.odoo.backend.audit.model.AuditAction.CREATE, org.odoo.backend.audit.model.AuditEntityType.VENDOR, savedVendor.getId().toString(), savedVendor.getName(), "Created Vendor " + savedVendor.getName());

        return mapToResponse(savedVendor);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "vendors", key = "#vendorId")
    public VendorResponse getVendor(UUID vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"));

        return mapToResponse(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "vendors")
    public List<VendorResponse> getAllVendors() {

        return vendorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @CacheEvict(value = "vendors", allEntries = true)
    public VendorResponse updateVendor(
            UUID vendorId,
            UpdateVendorRequest request) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"));

        vendor.setName(request.getName());
        vendor.setEmail(request.getEmail());
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());

        Vendor savedVendor = vendorRepository.save(vendor);
        auditService.log(org.odoo.backend.audit.model.AuditAction.UPDATE, org.odoo.backend.audit.model.AuditEntityType.VENDOR, savedVendor.getId().toString(), savedVendor.getName(), "Updated Vendor " + savedVendor.getName());

        return mapToResponse(savedVendor);
    }

    @Override
    @CacheEvict(value = "vendors", allEntries = true)
    public void deleteVendor(UUID vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"));

        vendorRepository.delete(vendor);
        auditService.log(org.odoo.backend.audit.model.AuditAction.DELETE, org.odoo.backend.audit.model.AuditEntityType.VENDOR, vendor.getId().toString(), vendor.getName(), "Deleted Vendor " + vendor.getName());
    }

    private String generateVendorCode() {
        return "VEN-" + System.currentTimeMillis();
    }

    private VendorResponse mapToResponse(
            Vendor vendor) {

        return VendorResponse.builder()
                .id(vendor.getId())
                .vendorCode(vendor.getVendorCode())
                .name(vendor.getName())
                .email(vendor.getEmail())
                .phone(vendor.getPhone())
                .address(vendor.getAddress())
                .build();
    }
}