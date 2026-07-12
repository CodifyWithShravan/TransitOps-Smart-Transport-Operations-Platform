package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.DriverRequest;
import com.example.Transit_Backend.dto.response.DriverResponse;
import com.example.Transit_Backend.model.enums.DriverStatus;
import com.example.Transit_Backend.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Driver management.
 *
 * <p>Provides CRUD operations and status management endpoints
 * for driver profiles and compliance tracking.</p>
 */
@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverService driverService;

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        DriverResponse response = driverService.createDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers(
            @RequestParam(required = false) DriverStatus status) {
        List<DriverResponse> drivers = (status != null)
                ? driverService.getDriversByStatus(status)
                : driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> updateDriver(
            @PathVariable Long id,
            @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    // ── STATUS MANAGEMENT ────────────────────────────────────────────────

    @PatchMapping("/{id}/status")
    public ResponseEntity<DriverResponse> updateDriverStatus(
            @PathVariable Long id,
            @RequestParam DriverStatus status) {
        return ResponseEntity.ok(driverService.updateDriverStatus(id, status));
    }
}
