package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.inventory.model.AdjustmentType;
import org.odoo.backend.inventory.model.StockAdjustment;
import org.odoo.backend.inventory.repositories.StockAdjustmentRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockAdjustmentSeeder {

    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final ProductRepository productRepository;

    public void seed() {
        int inserted = 0;
        int alreadyPresent = 0;

        if (seedAdjustmentIfMissing("ADJ-2026-0001", "FG001", AdjustmentType.INCREASE, "10", "Opening balance correction")) inserted++; else alreadyPresent++;
        if (seedAdjustmentIfMissing("ADJ-2026-0002", "FG002", AdjustmentType.DECREASE, "2", "Damaged items")) inserted++; else alreadyPresent++;
        if (seedAdjustmentIfMissing("ADJ-2026-0003", "RM003", AdjustmentType.DECREASE, "100", "Count mismatch")) inserted++; else alreadyPresent++;
        if (seedAdjustmentIfMissing("ADJ-2026-0004", "RM006", AdjustmentType.INCREASE, "15", "Physical stock found")) inserted++; else alreadyPresent++;
        if (seedAdjustmentIfMissing("ADJ-2026-0005", "RM019", AdjustmentType.DECREASE, "5", "Transit damage")) inserted++; else alreadyPresent++;

        log.info("Stock-adjustment seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private boolean seedAdjustmentIfMissing(String number, String productCode, AdjustmentType type, String qty, String reason) {
        if (stockAdjustmentRepository.findByAdjustmentNumber(number).isPresent()) {
            return false;
        }

        StockAdjustment adjustment = adjustment(number, productCode, type, qty, reason);
        applyStockEffect(adjustment);
        stockAdjustmentRepository.save(adjustment);
        return true;
    }

    private void applyStockEffect(StockAdjustment adjustment) {
        Product product = adjustment.getProduct();
        BigDecimal current = safe(product.getOnHandQty());
        BigDecimal quantity = adjustment.getQuantity();

        if (adjustment.getAdjustmentType() == AdjustmentType.INCREASE) {
            product.setOnHandQty(current.add(quantity));
        } else {
            BigDecimal next = current.subtract(quantity);
            product.setOnHandQty(next.signum() < 0 ? BigDecimal.ZERO : next);
        }
        productRepository.save(product);
    }

    private StockAdjustment adjustment(String number, String productCode, AdjustmentType type, String qty, String reason) {
        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setAdjustmentNumber(number);
        adjustment.setProduct(getProduct(productCode));
        adjustment.setAdjustmentType(type);
        adjustment.setQuantity(new BigDecimal(qty));
        adjustment.setReason(reason);
        return adjustment;
    }

    private Product getProduct(String code) {
        return productRepository.findByProductCode(code)
                .orElseThrow(() -> new IllegalStateException("Product not found: " + code));
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
