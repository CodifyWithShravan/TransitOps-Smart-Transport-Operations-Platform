package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.VehicleRequest;
import com.example.Transit_Backend.dto.response.VehicleResponse;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Vehicle management.
 *
 * <p>Provides CRUD operations and status management endpoints
 * for the fleet vehicle registry.</p>
 */
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @RequestParam(required = false) VehicleStatus status) {
        List<VehicleResponse> vehicles = (status != null)
                ? vehicleService.getVehiclesByStatus(status)
                : vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // ── STATUS MANAGEMENT ────────────────────────────────────────────────

    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleResponse> updateVehicleStatus(
            @PathVariable Long id,
            @RequestParam VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(id, status));
    }
}
