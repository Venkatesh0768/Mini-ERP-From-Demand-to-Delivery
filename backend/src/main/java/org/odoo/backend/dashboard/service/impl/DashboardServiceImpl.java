package org.odoo.backend.dashboard.service.impl;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.repository.UserRepository;
import org.odoo.backend.customer.repositories.CustomerRepository;
import org.odoo.backend.dashboard.dto.DashboardResponse;
import org.odoo.backend.dashboard.service.DashboardService;
import org.odoo.backend.manufacturing.repositories.ManufacturingOrderRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.purchase.repositories.PurchaseOrderRepository;
import org.odoo.backend.sales.repositories.SalesOrderRepository;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl
        implements DashboardService {

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;

    private final VendorRepository vendorRepository;

    private final SalesOrderRepository salesOrderRepository;

    private final PurchaseOrderRepository purchaseOrderRepository;

    private final ManufacturingOrderRepository manufacturingOrderRepository;

    @Override
    public DashboardResponse getDashboard() {

        BigDecimal inventoryValue = BigDecimal.ZERO;

        for (Product product : productRepository.findAll()) {

            if (product.getOnHandQty() != null &&
                    product.getCostPrice() != null) {

                inventoryValue =
                        inventoryValue.add(
                                product.getOnHandQty()
                                        .multiply(
                                                product.getCostPrice()));
            }
        }

        return DashboardResponse.builder()
                .totalUsers(
                        userRepository.count())

                .totalProducts(
                        productRepository.count())

                .totalCustomers(
                        customerRepository.count())

                .totalVendors(
                        vendorRepository.count())

                .totalSalesOrders(
                        salesOrderRepository.count())

                .totalPurchaseOrders(
                        purchaseOrderRepository.count())

                .totalManufacturingOrders(
                        manufacturingOrderRepository.count())

                .lowStockProducts(
                        productRepository
                                .countByOnHandQtyLessThan(
                                        BigDecimal.TEN))

                .inventoryValue(
                        inventoryValue)
                .build();
    }
}