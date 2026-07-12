package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.FuelLogRequest;
import com.example.Transit_Backend.dto.response.FuelLogResponse;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.model.FuelLog;
import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.repository.FuelLogRepository;
import com.example.Transit_Backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Fuel Log management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class FuelLogService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleService vehicleService;
    private final TripRepository tripRepository;

    // ── CREATE ────────────────────────────────────────────────────────────

    public FuelLogResponse createFuelLog(FuelLogRequest request) {
        Vehicle vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip", request.getTripId()));
        }

        FuelLog fuelLog = FuelLog.builder()
                .vehicle(vehicle)
                .trip(trip)
                .litres(request.getLitres())
                .cost(request.getCost())
                .odometerReading(request.getOdometerReading())
                .date(request.getDate())
                .build();

        FuelLog saved = fuelLogRepository.save(fuelLog);
        return mapToResponse(saved);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public FuelLogResponse getFuelLogById(Long id) {
        FuelLog fuelLog = findFuelLogOrThrow(id);
        return mapToResponse(fuelLog);
    }

    @Transactional(readOnly = true)
    public List<FuelLogResponse> getAllFuelLogs() {
        return fuelLogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FuelLogResponse> getFuelLogsByVehicle(Long vehicleId) {
        return fuelLogRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FuelLogResponse> getFuelLogsByTrip(Long tripId) {
        return fuelLogRepository.findByTripId(tripId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    public FuelLogResponse updateFuelLog(Long id, FuelLogRequest request) {
        FuelLog fuelLog = findFuelLogOrThrow(id);
        Vehicle vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip", request.getTripId()));
        }

        fuelLog.setVehicle(vehicle);
        fuelLog.setTrip(trip);
        fuelLog.setLitres(request.getLitres());
        fuelLog.setCost(request.getCost());
        fuelLog.setOdometerReading(request.getOdometerReading());
        fuelLog.setDate(request.getDate());

        FuelLog updated = fuelLogRepository.save(fuelLog);
        return mapToResponse(updated);
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    public void deleteFuelLog(Long id) {
        FuelLog fuelLog = findFuelLogOrThrow(id);
        fuelLogRepository.delete(fuelLog);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    private FuelLog findFuelLogOrThrow(Long id) {
        return fuelLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FuelLog", id));
    }

    private FuelLogResponse mapToResponse(FuelLog log) {
        return FuelLogResponse.builder()
                .id(log.getId())
                .vehicleId(log.getVehicle().getId())
                .vehicleRegistrationNumber(log.getVehicle().getRegistrationNumber())
                .tripId(log.getTrip() != null ? log.getTrip().getId() : null)
                .litres(log.getLitres())
                .cost(log.getCost())
                .odometerReading(log.getOdometerReading())
                .date(log.getDate())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
