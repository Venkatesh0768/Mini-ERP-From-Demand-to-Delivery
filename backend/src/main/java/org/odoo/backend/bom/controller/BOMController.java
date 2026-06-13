package org.odoo.backend.bom.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.bom.dto.CreateBOMRequest;
import org.odoo.backend.bom.service.BOMService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/boms")
@RequiredArgsConstructor
public class BOMController {

    private final BOMService bomService;

    @PostMapping
    public ResponseEntity<ApiResponse> createBOM(
            @Valid @RequestBody CreateBOMRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        true,
                        "BOM created successfully",
                        bomService.createBOM(request)
                ));
    }

    @GetMapping("/{bomId}")
    public ResponseEntity<ApiResponse> getBOM(
            @PathVariable UUID bomId) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "BOM fetched successfully",
                        bomService.getBOM(bomId)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllBOMs() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "BOMs fetched successfully",
                        bomService.getAllBOMs()
                ));
    }

    @DeleteMapping("/{bomId}")
    public ResponseEntity<ApiResponse> deleteBOM(
            @PathVariable UUID bomId) {

        bomService.deleteBOM(bomId);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "BOM deleted successfully",
                        null
                ));
    }
}