package org.odoo.backend.vendor.repositories;

import org.odoo.backend.vendor.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
}