package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.bom.model.BOM;
import org.odoo.backend.bom.model.BOMComponent;
import org.odoo.backend.bom.repositories.BOMRepository;
import org.odoo.backend.manufacturing.model.ManufacturingOrder;
import org.odoo.backend.manufacturing.model.ManufacturingOrderItem;
import org.odoo.backend.manufacturing.model.ManufacturingOrderStatus;
import org.odoo.backend.manufacturing.repositories.ManufacturingOrderRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ManufacturingOrderSeeder {

    private final ManufacturingOrderRepository manufacturingOrderRepository;
    private final ProductRepository productRepository;
    private final BOMRepository bomRepository;

    @Transactional
    public void seed() {
        int inserted = 0;
        int alreadyPresent = 0;

        if (createOrderIfMissing("MO-2026-0001", "FG001", "BOM001", "10", ManufacturingOrderStatus.DRAFT, false)) inserted++; else alreadyPresent++;
        if (createOrderIfMissing("MO-2026-0002", "FG002", "BOM002", "12", ManufacturingOrderStatus.CONFIRMED, false)) inserted++; else alreadyPresent++;
        if (createOrderIfMissing("MO-2026-0003", "FG003", "BOM003", "8", ManufacturingOrderStatus.IN_PROGRESS, false)) inserted++; else alreadyPresent++;
        if (createOrderIfMissing("MO-2026-0004", "FG004", "BOM004", "6", ManufacturingOrderStatus.COMPLETED, true)) inserted++; else alreadyPresent++;
        if (createOrderIfMissing("MO-2026-0005", "FG005", "BOM005", "4", ManufacturingOrderStatus.COMPLETED, true)) inserted++; else alreadyPresent++;

        log.info("Manufacturing-order seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private boolean createOrderIfMissing(String number, String productCode, String bomCode, String qtyToProduce,
                                         ManufacturingOrderStatus status, boolean applyStockMovement) {
        if (manufacturingOrderRepository.findByOrderNumber(number).isPresent()) {
            return false;
        }

        Product finishedProduct = getProduct(productCode);
        BOM bom = getBom(bomCode);
        BigDecimal quantity = new BigDecimal(qtyToProduce);

        ManufacturingOrder order = new ManufacturingOrder();
        order.setOrderNumber(number);
        order.setProduct(finishedProduct);
        order.setBom(bom);
        order.setQuantityToProduce(quantity);
        order.setStatus(status);

        List<ManufacturingOrderItem> items = bom.getComponents().stream()
                .map(component -> toMoItem(order, component, quantity, applyStockMovement))
                .toList();
        order.setItems(items);

        manufacturingOrderRepository.save(order);

        if (applyStockMovement) {
            applyCompletedStockMove(finishedProduct, bom.getComponents(), quantity);
        }
        return true;
    }

    private ManufacturingOrderItem toMoItem(ManufacturingOrder order, BOMComponent component, BigDecimal qtyToProduce,
                                            boolean fullyConsumed) {
        BigDecimal required = component.getRequiredQuantity().multiply(qtyToProduce);

        ManufacturingOrderItem item = new ManufacturingOrderItem();
        item.setManufacturingOrder(order);
        item.setComponentProduct(component.getComponentProduct());
        item.setRequiredQuantity(required);
        item.setConsumedQuantity(fullyConsumed ? required : BigDecimal.ZERO);
        return item;
    }

    private void applyCompletedStockMove(Product finishedProduct, List<BOMComponent> components, BigDecimal producedQty) {
        for (BOMComponent component : components) {
            Product raw = component.getComponentProduct();
            BigDecimal current = safe(raw.getOnHandQty());
            BigDecimal consumed = component.getRequiredQuantity().multiply(producedQty);
            BigDecimal remaining = current.subtract(consumed);
            if (remaining.signum() < 0) {
                remaining = BigDecimal.ZERO;
            }
            raw.setOnHandQty(remaining);
            productRepository.save(raw);
        }

        finishedProduct.setOnHandQty(safe(finishedProduct.getOnHandQty()).add(producedQty));
        productRepository.save(finishedProduct);
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Product getProduct(String code) {
        return productRepository.findByProductCode(code)
                .orElseThrow(() -> new IllegalStateException("Product not found: " + code));
    }

    private BOM getBom(String code) {
        return bomRepository.findByBomCode(code)
                .orElseThrow(() -> new IllegalStateException("BOM not found: " + code));
    }
}
