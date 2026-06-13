package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.product.model.ProcurementType;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.model.ProductType;
import org.odoo.backend.product.repositories.ProductRepository;
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
public class ProductSeeder {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    public void seed() {
        log.info("Seeding products...");

        Map<String, Vendor> vendorsByCode = vendorRepository.findAll().stream()
                .filter(vendor -> vendor.getVendorCode() != null)
                .collect(Collectors.toMap(Vendor::getVendorCode, Function.identity()));

        List<Product> templates = List.of(
                buildProduct("FG001", "Wooden Table",
                        "Solid wood office table with smooth finish",
                        bd("8500"), bd("5200"), bd("50"), bd("10"),
                        ProductType.FINISHED_GOOD, ProcurementType.MANUFACTURING, false, null),
                buildProduct("FG002", "Office Chair",
                        "Ergonomic office chair with foam cushion and wheels",
                        bd("6200"), bd("3800"), bd("75"), bd("15"),
                        ProductType.FINISHED_GOOD, ProcurementType.MANUFACTURING, false, null),
                buildProduct("FG003", "Study Desk",
                        "Compact study desk for home and student use",
                        bd("5500"), bd("3200"), bd("40"), bd("8"),
                        ProductType.FINISHED_GOOD, ProcurementType.MANUFACTURING, false, null),
                buildProduct("FG004", "Storage Cabinet",
                        "Multi-shelf wooden storage cabinet",
                        bd("9800"), bd("6100"), bd("30"), bd("5"),
                        ProductType.FINISHED_GOOD, ProcurementType.MANUFACTURING, false, null),
                buildProduct("FG005", "Conference Table",
                        "Large rectangular conference room table for 10 persons",
                        bd("24000"), bd("15000"), bd("15"), bd("3"),
                        ProductType.FINISHED_GOOD, ProcurementType.MANUFACTURING, false, null),

                buildProduct("RM001", "Wooden Leg",
                        "Solid wood table/chair leg, 70cm height",
                        bd("320"), bd("180"), bd("500"), bd("80"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V001")),
                buildProduct("RM002", "Wooden Top",
                        "Flat wooden panel for table top, 120x60cm",
                        bd("1100"), bd("650"), bd("200"), bd("30"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V001")),
                buildProduct("RM003", "Screw (M6x30)",
                        "Zinc-plated M6x30 wood screws, pack of 100",
                        bd("85"), bd("45"), bd("2000"), bd("200"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V019")),
                buildProduct("RM004", "Bolt (M8x50)",
                        "Hex head bolt M8x50mm, grade 8.8",
                        bd("12"), bd("6"), bd("5000"), bd("500"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V020")),
                buildProduct("RM005", "Nut (M8)",
                        "Hex nut M8, grade 8, zinc plated",
                        bd("5"), bd("2.5"), bd("8000"), bd("800"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V020")),
                buildProduct("RM006", "Steel Rod (25mm)",
                        "Mild steel round bar 25mm diameter, per metre",
                        bd("220"), bd("130"), bd("300"), bd("50"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V003")),
                buildProduct("RM007", "Foam Cushion",
                        "High-density foam cushion 50x50x10cm for seating",
                        bd("450"), bd("260"), bd("400"), bd("60"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V010")),
                buildProduct("RM008", "Paint (White, 1L)",
                        "Interior wood paint, matte white, 1 litre can",
                        bd("340"), bd("190"), bd("600"), bd("80"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V011")),
                buildProduct("RM009", "Glue (Wood Adhesive, 500ml)",
                        "PVA wood adhesive, fast-setting, 500ml bottle",
                        bd("175"), bd("90"), bd("700"), bd("100"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V012")),
                buildProduct("RM010", "Wheel (50mm Caster)",
                        "Swivel caster wheel 50mm with brake, each",
                        bd("120"), bd("65"), bd("1000"), bd("150"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V013")),
                buildProduct("RM011", "Metal Frame (Chair Base)",
                        "5-star metal base for office chair, chrome finish",
                        bd("680"), bd("400"), bd("250"), bd("40"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V014")),
                buildProduct("RM012", "Handle (Cabinet Pull)",
                        "Stainless steel cabinet pull handle, 128mm hole centre",
                        bd("95"), bd("50"), bd("1500"), bd("200"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V015")),
                buildProduct("RM013", "Rubber Pad (Anti-slip)",
                        "Self-adhesive rubber foot pad, 30mm diameter, pack of 4",
                        bd("40"), bd("20"), bd("3000"), bd("300"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V016")),
                buildProduct("RM014", "Packaging Box (Large)",
                        "Double-walled corrugated box, 120x65x80cm",
                        bd("135"), bd("70"), bd("800"), bd("100"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V017")),
                buildProduct("RM015", "Tape Roll (Brown, 48mm)",
                        "Heavy-duty packaging tape, 48mm x 100m roll",
                        bd("55"), bd("28"), bd("1200"), bd("150"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V018")),
                buildProduct("RM016", "Sandpaper Sheet (P120)",
                        "120-grit aluminium oxide sandpaper sheet",
                        bd("18"), bd("8"), bd("2000"), bd("200"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V001")),
                buildProduct("RM017", "Drawer Slide (450mm Pair)",
                        "Full-extension ball-bearing drawer slide pair, 450mm",
                        bd("360"), bd("200"), bd("600"), bd("80"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V014")),
                buildProduct("RM018", "Plywood Sheet (18mm)",
                        "Moisture-resistant plywood 18mm, 8x4 ft sheet",
                        bd("1800"), bd("1050"), bd("150"), bd("20"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V001")),
                buildProduct("RM019", "Gas Lift Cylinder",
                        "Adjustable height gas lift for office chair, class-4",
                        bd("520"), bd("300"), bd("300"), bd("40"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V014")),
                buildProduct("RM020", "Armrest Pair (PP)",
                        "Polypropylene office chair armrest pair, height-adjustable",
                        bd("390"), bd("220"), bd("400"), bd("50"),
                        ProductType.RAW_MATERIAL, ProcurementType.PURCHASE, true, getVendor(vendorsByCode, "V014"))
        );

        Map<String, Product> existingByCode = productRepository.findAll().stream()
                .filter(product -> product.getProductCode() != null)
                .collect(Collectors.toMap(Product::getProductCode, Function.identity(), (left, right) -> left));

        int inserted = 0;
        int alreadyPresent = 0;

        for (Product template : templates) {
            Product existing = existingByCode.get(template.getProductCode());
            if (existing != null) {
                alreadyPresent++;
                continue;
            }
            productRepository.save(template);
            inserted++;
        }

        log.info("Product seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private Vendor getVendor(Map<String, Vendor> vendorsByCode, String code) {
        Vendor vendor = vendorsByCode.get(code);
        if (vendor == null) {
            throw new IllegalStateException("Vendor not found for code: " + code);
        }
        return vendor;
    }

    private Product buildProduct(String code, String name, String description,
                                 BigDecimal salesPrice, BigDecimal costPrice,
                                 BigDecimal onHandQty, BigDecimal reservedQty,
                                 ProductType productType, ProcurementType procurementType,
                                 boolean procureOnDemand, Vendor vendor) {
        Product p = new Product();
        p.setProductCode(code);
        p.setName(name);
        p.setDescription(description);
        p.setSalesPrice(salesPrice);
        p.setCostPrice(costPrice);
        p.setOnHandQty(onHandQty);
        p.setReservedQty(reservedQty);
        p.setProductType(productType);
        p.setProcurementType(procurementType);
        p.setProcureOnDemand(procureOnDemand);
        p.setVendor(vendor);
        return p;
    }

    private BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
