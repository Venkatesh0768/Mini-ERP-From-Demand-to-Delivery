package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.purchase.model.PurchaseOrder;
import org.odoo.backend.purchase.model.PurchaseOrderItem;
import org.odoo.backend.purchase.model.PurchaseOrderStatus;
import org.odoo.backend.purchase.repositories.PurchaseOrderRepository;
import org.odoo.backend.vendor.model.Vendor;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PurchaseOrderSeeder {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;

    public void seed() {
        Map<String, Vendor> vendorsByCode = vendorRepository.findAll().stream()
                .filter(vendor -> vendor.getVendorCode() != null)
                .collect(Collectors.toMap(Vendor::getVendorCode, Function.identity()));

        int inserted = 0;
        int alreadyPresent = 0;

        if (createOrderIfMissing("PO-2026-0001", getVendor(vendorsByCode, "V001"), PurchaseOrderStatus.DRAFT, List.of(
                item("RM001", "100", "0", "180"),
                item("RM002", "50", "0", "650")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("PO-2026-0002", getVendor(vendorsByCode, "V019"), PurchaseOrderStatus.CONFIRMED, List.of(
                item("RM003", "3000", "0", "45"),
                item("RM004", "1500", "0", "6")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("PO-2026-0003", getVendor(vendorsByCode, "V020"), PurchaseOrderStatus.RECEIVED, List.of(
                item("RM005", "5000", "5000", "2.5")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("PO-2026-0004", getVendor(vendorsByCode, "V014"), PurchaseOrderStatus.RECEIVED, List.of(
                item("RM011", "200", "200", "400"),
                item("RM019", "200", "200", "300")
        ))) inserted++; else alreadyPresent++;

        if (createOrderIfMissing("PO-2026-0005", getVendor(vendorsByCode, "V003"), PurchaseOrderStatus.CONFIRMED, List.of(
                item("RM006", "300", "0", "130")
        ))) inserted++; else alreadyPresent++;

        log.info("Purchase-order seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private boolean createOrderIfMissing(String number, Vendor vendor, PurchaseOrderStatus status, List<PurchaseOrderItem> items) {
        if (purchaseOrderRepository.findByOrderNumber(number).isPresent()) {
            return false;
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(number);
        po.setVendor(vendor);
        po.setStatus(status);

        for (PurchaseOrderItem item : items) {
            item.setPurchaseOrder(po);
        }
        po.setItems(items);

        purchaseOrderRepository.save(po);
        return true;
    }

    private PurchaseOrderItem item(String productCode, String orderedQty, String receivedQty, String unitCost) {
        BigDecimal ordered = new BigDecimal(orderedQty);
        BigDecimal received = new BigDecimal(receivedQty);
        BigDecimal cost = new BigDecimal(unitCost);

        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProduct(getProduct(productCode));
        item.setOrderedQty(ordered);
        item.setReceivedQty(received);
        item.setUnitCost(cost);
        item.setTotalCost(ordered.multiply(cost));
        return item;
    }

    private Product getProduct(String code) {
        return productRepository.findByProductCode(code)
                .orElseThrow(() -> new IllegalStateException("Product not found: " + code));
    }

    private Vendor getVendor(Map<String, Vendor> vendorsByCode, String code) {
        Vendor vendor = vendorsByCode.get(code);
        if (vendor == null) {
            throw new IllegalStateException("Vendor not found for code: " + code);
        }
        return vendor;
    }
}
