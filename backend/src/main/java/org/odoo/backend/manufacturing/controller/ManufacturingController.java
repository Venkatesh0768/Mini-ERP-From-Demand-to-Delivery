package org.odoo.backend.manufacturing.controller;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.manufacturing.dto.CreateManufacturingOrderRequest;
import org.odoo.backend.manufacturing.service.ManufacturingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/manufacturing-orders")
@RequiredArgsConstructor
public class ManufacturingController {

    private final ManufacturingService manufacturingService;

    @PostMapping
    public ResponseEntity<ApiResponse> createManufacturingOrder(
            @Valid @RequestBody CreateManufacturingOrderRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Manufacturing order created successfully",
                        manufacturingService
                                .createManufacturingOrder(request)
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getManufacturingOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Manufacturing order fetched successfully",
                        manufacturingService
                                .getManufacturingOrder(id)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllManufacturingOrders() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Manufacturing orders fetched successfully",
                        manufacturingService
                                .getAllManufacturingOrders()
                ));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse> confirmOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Manufacturing order confirmed",
                        manufacturingService.confirmOrder(id)
                ));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse> startProduction(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Production started",
                        manufacturingService.startProduction(id)
                ));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse> completeOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Production completed",
                        manufacturingService.completeOrder(id)
                ));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Manufacturing order cancelled",
                        manufacturingService.cancelOrder(id)
                ));
    }
}