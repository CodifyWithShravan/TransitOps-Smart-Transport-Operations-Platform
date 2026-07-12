package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin utility controller for clearing operational data or resetting database for testing.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AdminController {

    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @DeleteMapping("/clear-data")
    @Transactional
    public ResponseEntity<Map<String, String>> clearAllOperationalData() {
        log.info("Clearing all operational data (Trips, Maintenance, Fuel, Expenses, Vehicles, Drivers)...");
        expenseRepository.deleteAll();
        fuelLogRepository.deleteAll();
        maintenanceLogRepository.deleteAll();
        tripRepository.deleteAll();
        vehicleRepository.deleteAll();
        driverRepository.deleteAll();
        log.info("Operational data cleared successfully.");
        return ResponseEntity.ok(Map.of("message", "All operational data has been cleared successfully."));
    }
}
