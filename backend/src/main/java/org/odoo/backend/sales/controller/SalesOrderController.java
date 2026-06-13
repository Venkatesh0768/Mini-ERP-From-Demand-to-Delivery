package org.odoo.backend.sales.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.sales.dto.CreateSalesOrderRequest;
import org.odoo.backend.sales.service.SalesOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse> createSalesOrder(@Valid @RequestBody CreateSalesOrderRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Sales order created successfully",
                        salesOrderService.createSalesOrder(request)
                ));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse> getSalesOrder(@PathVariable UUID orderId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Sales order fetched successfully",
                        salesOrderService.getSalesOrder(orderId)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllSalesOrders() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Sales orders fetched successfully",
                        salesOrderService.getAllSalesOrders()
                ));
    }

    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<ApiResponse> confirmOrder(@PathVariable UUID orderId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Sales order confirmed successfully",
                        salesOrderService.confirmOrder(orderId)
                ));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable UUID orderId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Sales order cancelled successfully",
                        salesOrderService.cancelOrder(orderId)
                ));
    }
}
