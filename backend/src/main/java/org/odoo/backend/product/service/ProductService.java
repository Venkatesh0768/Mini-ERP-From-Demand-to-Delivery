package org.odoo.backend.product.service;

import org.odoo.backend.product.dto.CreateProductRequest;
import org.odoo.backend.product.dto.ProductResponse;
import org.odoo.backend.product.dto.UpdateProductRequest;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(
            CreateProductRequest request);

    ProductResponse getProduct(UUID productId);

    List<ProductResponse> getAllProducts();

    ProductResponse updateProduct(
            UUID productId,
            UpdateProductRequest request);

    void deleteProduct(UUID productId);
}