package org.odoo.backend.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.inventory.dto.*;
import org.odoo.backend.inventory.model.*;
import org.odoo.backend.inventory.repositories.StockAdjustmentRepository;
import org.odoo.backend.inventory.service.StockAdjustmentService;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StockAdjustmentServiceImpl
        implements StockAdjustmentService {

    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final ProductRepository productRepository;

    @Override
    public StockAdjustmentResponse createAdjustment(
            CreateStockAdjustmentRequest request) {

        Product product =
                productRepository.findById(request.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException("Product not found"));

        switch (request.getAdjustmentType()) {

            case INCREASE ->
                    product.setOnHandQty(
                            product.getOnHandQty()
                                    .add(request.getQuantity()));

            case DECREASE -> {

                if (product.getOnHandQty()
                        .compareTo(request.getQuantity()) < 0) {

                    throw new RuntimeException(
                            "Insufficient stock");
                }

                product.setOnHandQty(
                        product.getOnHandQty()
                                .subtract(request.getQuantity()));
            }
        }

        productRepository.save(product);

        StockAdjustment adjustment =
                StockAdjustment.builder()
                        .adjustmentNumber(
                                generateAdjustmentNumber())
                        .product(product)
                        .adjustmentType(
                                request.getAdjustmentType())
                        .quantity(request.getQuantity())
                        .reason(request.getReason())
                        .build();

        return mapToResponse(
                stockAdjustmentRepository.save(adjustment));
    }

    @Override
    public StockAdjustmentResponse getAdjustment(
            UUID id) {

        return stockAdjustmentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Adjustment not found"));
    }

    @Override
    public List<StockAdjustmentResponse>
    getAllAdjustments() {

        return stockAdjustmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private String generateAdjustmentNumber() {
        return "ADJ-" + System.currentTimeMillis();
    }

    private StockAdjustmentResponse mapToResponse(
            StockAdjustment adjustment) {

        return StockAdjustmentResponse.builder()
                .id(adjustment.getId())
                .adjustmentNumber(
                        adjustment.getAdjustmentNumber())
                .productId(
                        adjustment.getProduct().getId())
                .productName(
                        adjustment.getProduct().getName())
                .adjustmentType(
                        adjustment.getAdjustmentType())
                .quantity(
                        adjustment.getQuantity())
                .reason(
                        adjustment.getReason())
                .createdAt(
                        adjustment.getCreatedAt())
                .build();
    }
}