package org.odoo.backend.inventory.controller;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse>
    getAllTransactions() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Inventory transactions fetched",
                        inventoryService.getAllTransactions()
                ));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse>
    getProductHistory(
            @PathVariable UUID productId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Product history fetched",
                        inventoryService
                                .getProductHistory(productId)
                ));
    }
}