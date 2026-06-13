package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.customer.model.Customer;
import org.odoo.backend.customer.repositories.CustomerRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.sales.model.SalesOrder;
import org.odoo.backend.sales.model.SalesOrderItem;
import org.odoo.backend.sales.model.SalesOrderStatus;
import org.odoo.backend.sales.repositories.SalesOrderRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SalesOrderSeeder {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public void seed() {
        int inserted = 0;
        int alreadyPresent = 0;

        if (createOrderIfMissing("SO-2026-0001", getCustomer("C001"), SalesOrderStatus.DRAFT, List.of(
                item("FG001", "5", "0", "8500"),
                item("FG002", "10", "0", "6200")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("SO-2026-0002", getCustomer("C002"), SalesOrderStatus.CONFIRMED, List.of(
                item("FG003", "8", "0", "5500")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("SO-2026-0003", getCustomer("C003"), SalesOrderStatus.DELIVERED, List.of(
                item("FG004", "6", "6", "9800")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("SO-2026-0004", getCustomer("C004"), SalesOrderStatus.CANCELLED, List.of(
                item("FG005", "2", "0", "24000")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("SO-2026-0005", getCustomer("C005"), SalesOrderStatus.PARTIALLY_DELIVERED, List.of(
                item("FG002", "12", "7", "6200")
        ))) inserted++; else alreadyPresent++;

        log.info("Sales-order seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private boolean createOrderIfMissing(String number, Customer customer, SalesOrderStatus status, List<SalesOrderItem> items) {
        if (salesOrderRepository.findByOrderNumber(number).isPresent()) {
            return false;
        }

        SalesOrder so = new SalesOrder();
        so.setOrderNumber(number);
        so.setCustomer(customer);
        so.setStatus(status);

        for (SalesOrderItem item : items) {
            item.setSalesOrder(so);
        }
        so.setItems(items);

        salesOrderRepository.save(so);
        return true;
    }

    private SalesOrderItem item(String productCode, String orderedQty, String deliveredQty, String unitPrice) {
        BigDecimal ordered = new BigDecimal(orderedQty);
        BigDecimal delivered = new BigDecimal(deliveredQty);
        BigDecimal price = new BigDecimal(unitPrice);

        SalesOrderItem item = new SalesOrderItem();
        item.setProduct(getProduct(productCode));
        item.setOrderedQty(ordered);
        item.setDeliveredQty(delivered);
        item.setUnitPrice(price);
        item.setTotalAmount(ordered.multiply(price));
        return item;
    }

    private Customer getCustomer(String code) {
        return customerRepository.findByCustomerCode(code)
                .orElseThrow(() -> new IllegalStateException("Customer not found: " + code));
    }

    private Product getProduct(String code) {
        return productRepository.findByProductCode(code)
                .orElseThrow(() -> new IllegalStateException("Product not found: " + code));
    }
}
