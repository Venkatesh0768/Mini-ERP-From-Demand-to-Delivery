package org.odoo.backend.inventory.controller;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.inventory.dto.CreateStockAdjustmentRequest;
import org.odoo.backend.inventory.service.StockAdjustmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/stock-adjustments")
@RequiredArgsConstructor
public class StockAdjustmentController {

    private final StockAdjustmentService stockAdjustmentService;

    @PostMapping
    public ResponseEntity<ApiResponse> createAdjustment(
            @RequestBody CreateStockAdjustmentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Stock adjusted successfully",
                        stockAdjustmentService.createAdjustment(request)
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getAdjustment(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Adjustment fetched successfully",
                        stockAdjustmentService.getAdjustment(id)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllAdjustments() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Adjustments fetched successfully",
                        stockAdjustmentService.getAllAdjustments()
                ));
    }
}