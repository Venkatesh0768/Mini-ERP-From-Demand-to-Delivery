package org.odoo.backend.dashboard.controller;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.auth.dto.ApiResponse;
import org.odoo.backend.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse> getDashboard() {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Dashboard loaded successfully",
                        dashboardService.getDashboard()
                ));
    }
}