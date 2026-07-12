package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.FuelLogRequest;
import com.example.Transit_Backend.dto.response.FuelLogResponse;
import com.example.Transit_Backend.service.FuelLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Fuel Log management.
 */
@RestController
@RequestMapping("/api/fuel-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FuelLogController {

    private final FuelLogService fuelLogService;

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<FuelLogResponse> createFuelLog(@Valid @RequestBody FuelLogRequest request) {
        FuelLogResponse response = fuelLogService.createFuelLog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<FuelLogResponse>> getAllFuelLogs() {
        return ResponseEntity.ok(fuelLogService.getAllFuelLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelLogResponse> getFuelLogById(@PathVariable Long id) {
        return ResponseEntity.ok(fuelLogService.getFuelLogById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelLogResponse>> getFuelLogsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelLogService.getFuelLogsByVehicle(vehicleId));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<FuelLogResponse>> getFuelLogsByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(fuelLogService.getFuelLogsByTrip(tripId));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<FuelLogResponse> updateFuelLog(
            @PathVariable Long id,
            @Valid @RequestBody FuelLogRequest request) {
        return ResponseEntity.ok(fuelLogService.updateFuelLog(id, request));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelLog(@PathVariable Long id) {
        fuelLogService.deleteFuelLog(id);
        return ResponseEntity.noContent().build();
    }
}
