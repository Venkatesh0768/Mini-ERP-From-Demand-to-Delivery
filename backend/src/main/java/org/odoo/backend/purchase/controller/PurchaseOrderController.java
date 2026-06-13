package org.odoo.backend.purchase.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.purchase.dto.CreatePurchaseOrderRequest;
import org.odoo.backend.purchase.service.PurchaseOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Purchase order created successfully",
                        purchaseOrderService.createPurchaseOrder(request)
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getPurchaseOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Purchase order fetched successfully",
                        purchaseOrderService.getPurchaseOrder(id)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllPurchaseOrders() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Purchase orders fetched successfully",
                        purchaseOrderService.getAllPurchaseOrders()
                ));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse> confirmOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Purchase order confirmed successfully",
                        purchaseOrderService.confirmOrder(id)
                ));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<ApiResponse> receiveOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Purchase order received successfully",
                        purchaseOrderService.receiveOrder(id)
                ));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Purchase order cancelled successfully",
                        purchaseOrderService.cancelOrder(id)
                ));
    }
}