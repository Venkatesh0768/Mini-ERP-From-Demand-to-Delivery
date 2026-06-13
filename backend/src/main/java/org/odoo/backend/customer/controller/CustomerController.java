package org.odoo.backend.customer.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.customer.dto.CreateCustomerRequest;
import org.odoo.backend.customer.dto.UpdateCustomerRequest;
import org.odoo.backend.customer.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "Customer created successfully",
                        customerService.createCustomer(request)
                ));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse> getCustomer(
            @PathVariable UUID customerId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Customer fetched successfully",
                        customerService.getCustomer(customerId)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCustomers() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Customers fetched successfully",
                        customerService.getAllCustomers()
                ));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<ApiResponse> updateCustomer(
            @PathVariable UUID customerId,
            @Valid @RequestBody UpdateCustomerRequest request) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Customer updated successfully",
                        customerService.updateCustomer(
                                customerId,
                                request
                        )
                ));
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse> deleteCustomer(
            @PathVariable UUID customerId) {

        customerService.deleteCustomer(customerId);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Customer deleted successfully",
                        null
                ));
    }
}