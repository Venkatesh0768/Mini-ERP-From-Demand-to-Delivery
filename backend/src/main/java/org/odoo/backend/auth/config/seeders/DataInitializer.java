package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component("demoDataSeederInitializer")
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserSeeder userSeeder;
    private final VendorSeeder vendorSeeder;
    private final CustomerSeeder customerSeeder;
    private final ProductSeeder productSeeder;
    private final BOMSeeder bomSeeder;
    private final PurchaseOrderSeeder purchaseOrderSeeder;
    private final SalesOrderSeeder salesOrderSeeder;
    private final ManufacturingOrderSeeder manufacturingOrderSeeder;
    private final StockAdjustmentSeeder stockAdjustmentSeeder;
    private final AuditLogSeeder auditLogSeeder;

    @Override
    public void run(String... args) {
        log.info("Demo data seeding started");

        userSeeder.seed();
        vendorSeeder.seed();
        customerSeeder.seed();
        productSeeder.seed();
        bomSeeder.seed();
        purchaseOrderSeeder.seed();
        salesOrderSeeder.seed();
        manufacturingOrderSeeder.seed();
        stockAdjustmentSeeder.seed();
        auditLogSeeder.seed();

        log.info("Demo data seeding finished");
    }
}
