package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.VehicleRequest;
import com.example.Transit_Backend.dto.response.VehicleResponse;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Vehicle CRUD and status management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    // ── CRUD ─────────────────────────────────────────────────────────────

    public VehicleResponse createVehicle(VehicleRequest request) {
        // Business Rule: registration number must be unique
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ValidationException(
                    "Vehicle with registration number '" + request.getRegistrationNumber() + "' already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .model(request.getModel())
                .type(request.getType())
                .maxLoadCapacity(request.getMaxLoadCapacity())
                .odometer(request.getOdometer())
                .acquisitionCost(request.getAcquisitionCost())
                .status(VehicleStatus.AVAILABLE)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = findVehicleOrThrow(id);
        return mapToResponse(vehicle);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = findVehicleOrThrow(id);

        // If registration number changed, check uniqueness
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber())
                && vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ValidationException(
                    "Vehicle with registration number '" + request.getRegistrationNumber() + "' already exists");
        }

        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setModel(request.getModel());
        vehicle.setType(request.getType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());

        Vehicle updated = vehicleRepository.save(vehicle);
        return mapToResponse(updated);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = findVehicleOrThrow(id);
        vehicleRepository.delete(vehicle);
    }

    // ── Status management ────────────────────────────────────────────────

    /**
     * Update vehicle status. Enforces that RETIRED vehicles cannot be made AVAILABLE.
     */
    public VehicleResponse updateVehicleStatus(Long id, VehicleStatus newStatus) {
        Vehicle vehicle = findVehicleOrThrow(id);

        if (vehicle.getStatus() == VehicleStatus.RETIRED && newStatus != VehicleStatus.RETIRED) {
            throw new ValidationException("A retired vehicle cannot be reactivated");
        }

        vehicle.setStatus(newStatus);
        Vehicle updated = vehicleRepository.save(vehicle);
        return mapToResponse(updated);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    public Vehicle findVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .model(vehicle.getModel())
                .type(vehicle.getType())
                .maxLoadCapacity(vehicle.getMaxLoadCapacity())
                .odometer(vehicle.getOdometer())
                .acquisitionCost(vehicle.getAcquisitionCost())
                .status(vehicle.getStatus())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
