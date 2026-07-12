package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.MaintenanceLogRequest;
import com.example.Transit_Backend.dto.response.MaintenanceLogResponse;
import com.example.Transit_Backend.exception.IllegalStateTransitionException;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.MaintenanceLog;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for Maintenance Log management.
 *
 * <p>Enforces the mandatory business rules:</p>
 * <ul>
 *   <li>Creating an OPEN maintenance log → Vehicle status becomes IN_SHOP</li>
 *   <li>Closing a maintenance log → Vehicle status reverts to AVAILABLE (unless RETIRED)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleService vehicleService;

    // ── CREATE (auto Vehicle → IN_SHOP) ──────────────────────────────────

    /**
     * Creates a new maintenance record in OPEN status and automatically
     * transitions the associated vehicle to IN_SHOP.
     */
    public MaintenanceLogResponse createMaintenanceLog(MaintenanceLogRequest request) {
        Vehicle vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());

        // Cannot create maintenance for a RETIRED vehicle
        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new ValidationException(
                    "Cannot create maintenance for retired vehicle '" + vehicle.getRegistrationNumber() + "'");
        }

        // Cannot create maintenance if vehicle is ON_TRIP
        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new ValidationException(
                    "Cannot create maintenance for vehicle '" + vehicle.getRegistrationNumber()
                            + "' while it is ON_TRIP");
        }

        MaintenanceLog log = MaintenanceLog.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .cost(request.getCost())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(MaintenanceStatus.OPEN)
                .build();

        // Business Rule: Vehicle → IN_SHOP
        vehicle.setStatus(VehicleStatus.IN_SHOP);

        MaintenanceLog saved = maintenanceLogRepository.save(log);
        return mapToResponse(saved);
    }

    // ── READ ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MaintenanceLogResponse getMaintenanceLogById(Long id) {
        MaintenanceLog log = findLogOrThrow(id);
        return mapToResponse(log);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> getAllMaintenanceLogs() {
        return maintenanceLogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> getMaintenanceLogsByVehicle(Long vehicleId) {
        return maintenanceLogRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> getMaintenanceLogsByStatus(MaintenanceStatus status) {
        return maintenanceLogRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── UPDATE ───────────────────────────────────────────────────────────

    public MaintenanceLogResponse updateMaintenanceLog(Long id, MaintenanceLogRequest request) {
        MaintenanceLog log = findLogOrThrow(id);

        if (log.getStatus() == MaintenanceStatus.CLOSED) {
            throw new ValidationException("Cannot update a closed maintenance log");
        }

        log.setMaintenanceType(request.getMaintenanceType());
        log.setDescription(request.getDescription());
        log.setCost(request.getCost());
        log.setStartDate(request.getStartDate());
        log.setEndDate(request.getEndDate());

        MaintenanceLog updated = maintenanceLogRepository.save(log);
        return mapToResponse(updated);
    }

    // ── CLOSE (auto Vehicle → AVAILABLE) ─────────────────────────────────

    /**
     * Closes a maintenance log and reverts the vehicle to AVAILABLE
     * (unless the vehicle is RETIRED).
     */
    public MaintenanceLogResponse closeMaintenanceLog(Long id) {
        MaintenanceLog log = findLogOrThrow(id);

        if (log.getStatus() == MaintenanceStatus.CLOSED) {
            throw new IllegalStateTransitionException("MaintenanceLog", "CLOSED", "CLOSED");
        }

        log.setStatus(MaintenanceStatus.CLOSED);
        log.setEndDate(LocalDate.now());

        // Business Rule: Vehicle → AVAILABLE (unless RETIRED)
        Vehicle vehicle = log.getVehicle();
        if (vehicle.getStatus() != VehicleStatus.RETIRED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        MaintenanceLog saved = maintenanceLogRepository.save(log);
        return mapToResponse(saved);
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    public void deleteMaintenanceLog(Long id) {
        MaintenanceLog log = findLogOrThrow(id);
        maintenanceLogRepository.delete(log);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    private MaintenanceLog findLogOrThrow(Long id) {
        return maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceLog", id));
    }

    private MaintenanceLogResponse mapToResponse(MaintenanceLog log) {
        return MaintenanceLogResponse.builder()
                .id(log.getId())
                .vehicleId(log.getVehicle().getId())
                .vehicleRegistrationNumber(log.getVehicle().getRegistrationNumber())
                .maintenanceType(log.getMaintenanceType())
                .description(log.getDescription())
                .cost(log.getCost())
                .startDate(log.getStartDate())
                .endDate(log.getEndDate())
                .status(log.getStatus())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
