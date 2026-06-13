package org.odoo.backend.product.service.impl;

import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;
import org.odoo.backend.audit.service.AuditService;
import org.odoo.backend.product.dto.CreateProductRequest;
import org.odoo.backend.product.dto.ProductResponse;
import org.odoo.backend.product.dto.UpdateProductRequest;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.product.service.ProductService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.vendor.model.Vendor;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.odoo.backend.vendor.service.VendorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final AuditService auditService;

    @Override
    public ProductResponse createProduct(CreateProductRequest request) {

        Vendor vendor = null;

        if (request.getVendorId() != null) {

            vendor = vendorRepository
                    .findById(request.getVendorId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Vendor not found"));
        }

        Product product = Product.builder()
                .productCode(generateProductCode())
                .name(request.getName())
                .description(request.getDescription())
                .salesPrice(request.getSalesPrice())
                .costPrice(request.getCostPrice())
                .productType(request.getProductType())
                .procurementType(
                        request.getProcurementType())
                .procureOnDemand(
                        request.isProcureOnDemand())
                .onHandQty(BigDecimal.ZERO)
                .reservedQty(BigDecimal.ZERO)
                .vendor(vendor)
                .build();

        Product saved =
                productRepository.save(product);

       auditService.log(AuditAction.CREATE, AuditEntityType.PRODUCT, saved.getId().toString(), saved.getName(), "Created Product " + saved.getName());


        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"));

        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProductResponse updateProduct(
            UUID productId,
            UpdateProductRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"));

        if (request.getVendorId() != null) {

            Vendor vendor = vendorRepository
                    .findById(request.getVendorId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Vendor not found"));

            product.setVendor(vendor);
        }

        product.setName(request.getName());
        product.setDescription(
                request.getDescription());

        product.setSalesPrice(
                request.getSalesPrice());

        product.setCostPrice(
                request.getCostPrice());

        product.setProductType(
                request.getProductType());

        product.setProcurementType(
                request.getProcurementType());

        product.setProcureOnDemand(
                request.isProcureOnDemand());

        return mapToResponse(
                productRepository.save(product));
    }

    @Override
    public void deleteProduct(UUID productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"));

        productRepository.delete(product);
    }

    private String generateProductCode() {
        return "PROD-" + System.currentTimeMillis();
    }

    private ProductResponse mapToResponse(
            Product product) {

        return ProductResponse.builder()
                .id(product.getId())
                .productCode(product.getProductCode())
                .name(product.getName())
                .description(product.getDescription())
                .salesPrice(product.getSalesPrice())
                .costPrice(product.getCostPrice())
                .onHandQty(product.getOnHandQty())
                .reservedQty(product.getReservedQty())
                .productType(product.getProductType())
                .procurementType(
                        product.getProcurementType())
                .vendorId(
                        product.getVendor() != null
                                ? product.getVendor().getId()
                                : null)
                .build();
    }
}