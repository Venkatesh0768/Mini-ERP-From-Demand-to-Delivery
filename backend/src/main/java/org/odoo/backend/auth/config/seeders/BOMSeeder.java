package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.bom.model.BOM;
import org.odoo.backend.bom.model.BOMComponent;
import org.odoo.backend.bom.repositories.BOMRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BOMSeeder {

    private final BOMRepository bomRepository;
    private final ProductRepository productRepository;

    public void seed() {
        int inserted = 0;
        int alreadyPresent = 0;

        if (saveBomIfMissing("BOM001", "FG001", List.of(
                component("RM001", "4"),
                component("RM002", "1"),
                component("RM003", "12"),
                component("RM009", "1"),
                component("RM013", "4")
        ))) inserted++; else alreadyPresent++;

        if (saveBomIfMissing("BOM002", "FG002", List.of(
                component("RM007", "2"),
                component("RM010", "5"),
                component("RM011", "1"),
                component("RM019", "1"),
                component("RM020", "1")
        ))) inserted++; else alreadyPresent++;

        if (saveBomIfMissing("BOM003", "FG003", List.of(
                component("RM001", "4"),
                component("RM018", "1"),
                component("RM017", "1"),
                component("RM012", "2"),
                component("RM003", "20")
        ))) inserted++; else alreadyPresent++;

        if (saveBomIfMissing("BOM004", "FG004", List.of(
                component("RM018", "3"),
                component("RM012", "4"),
                component("RM017", "2"),
                component("RM003", "30"),
                component("RM015", "1")
        ))) inserted++; else alreadyPresent++;

        if (saveBomIfMissing("BOM005", "FG005", List.of(
                component("RM001", "8"),
                component("RM002", "2"),
                component("RM006", "4"),
                component("RM003", "40"),
                component("RM015", "2")
        ))) inserted++; else alreadyPresent++;

        log.info("BOM seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private boolean saveBomIfMissing(String bomCode, String finishedCode, List<BOMComponent> components) {
        if (bomRepository.findByBomCode(bomCode).isPresent()) {
            return false;
        }

        Product finishedProduct = getProduct(finishedCode);

        BOM bom = new BOM();
        bom.setBomCode(bomCode);
        bom.setFinishedProduct(finishedProduct);
        bom.setQuantityProduced(BigDecimal.ONE);
        bom.setComponents(components);

        for (BOMComponent component : components) {
            component.setBom(bom);
        }

        bomRepository.save(bom);
        return true;
    }

    private BOMComponent component(String productCode, String qty) {
        BOMComponent bomComponent = new BOMComponent();
        bomComponent.setComponentProduct(getProduct(productCode));
        bomComponent.setRequiredQuantity(new BigDecimal(qty));
        return bomComponent;
    }

    private Product getProduct(String code) {
        return productRepository.findByProductCode(code)
                .orElseThrow(() -> new IllegalStateException("Product not found: " + code));
    }
}
