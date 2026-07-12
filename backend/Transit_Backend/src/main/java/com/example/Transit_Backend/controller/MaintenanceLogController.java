package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.MaintenanceLogRequest;
import com.example.Transit_Backend.dto.response.MaintenanceLogResponse;
import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import com.example.Transit_Backend.service.MaintenanceLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Maintenance Log management.
 *
 * <p>Creating a maintenance log automatically puts the vehicle IN_SHOP.
 * Closing it reverts the vehicle to AVAILABLE (unless RETIRED).</p>
 */
@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    // ── CREATE (Vehicle → IN_SHOP) ───────────────────────────────────────

    @PostMapping
    public ResponseEntity<MaintenanceLogResponse> createMaintenanceLog(
            @Valid @RequestBody MaintenanceLogRequest request) {
        MaintenanceLogResponse response = maintenanceLogService.createMaintenanceLog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<MaintenanceLogResponse>> getAllMaintenanceLogs(
            @RequestParam(required = false) MaintenanceStatus status) {
        List<MaintenanceLogResponse> logs = (status != null)
                ? maintenanceLogService.getMaintenanceLogsByStatus(status)
                : maintenanceLogService.getAllMaintenanceLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceLogResponse> getMaintenanceLogById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceLogService.getMaintenanceLogById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceLogResponse>> getMaintenanceLogsByVehicle(
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceLogService.getMaintenanceLogsByVehicle(vehicleId));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceLogResponse> updateMaintenanceLog(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceLogRequest request) {
        return ResponseEntity.ok(maintenanceLogService.updateMaintenanceLog(id, request));
    }

    // ── CLOSE (Vehicle → AVAILABLE) ──────────────────────────────────────

    @PatchMapping("/{id}/close")
    public ResponseEntity<MaintenanceLogResponse> closeMaintenanceLog(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceLogService.closeMaintenanceLog(id));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenanceLog(@PathVariable Long id) {
        maintenanceLogService.deleteMaintenanceLog(id);
        return ResponseEntity.noContent().build();
    }
}
