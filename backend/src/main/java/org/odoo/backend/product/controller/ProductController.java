package org.odoo.backend.product.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.product.dto.CreateProductRequest;
import org.odoo.backend.product.dto.UpdateProductRequest;
import org.odoo.backend.product.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Product created successfully",
                        productService.createProduct(request)
                ));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse> getProduct(
            @PathVariable UUID productId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Product fetched successfully",
                        productService.getProduct(productId)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProducts() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Products fetched successfully",
                        productService.getAllProducts()
                ));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Product updated successfully",
                        productService.updateProduct(productId, request)
                ));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse> deleteProduct(
            @PathVariable UUID productId) {

        productService.deleteProduct(productId);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Product deleted successfully",
                        null
                ));
    }
}