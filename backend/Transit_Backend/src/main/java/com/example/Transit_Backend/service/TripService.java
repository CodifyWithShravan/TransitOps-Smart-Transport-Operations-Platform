package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.TripRequest;
import com.example.Transit_Backend.dto.response.TripResponse;
import com.example.Transit_Backend.exception.IllegalStateTransitionException;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.Driver;
import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.DriverStatus;
import com.example.Transit_Backend.model.enums.TripStatus;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for Trip lifecycle management.
 *
 * <p>Enforces all mandatory business rules during trip creation,
 * dispatch, completion, and cancellation — including automatic
 * status transitions for the assigned Vehicle and Driver.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    // ── Create trip (status = DRAFT) ─────────────────────────────────────

    /**
     * Creates a new trip in DRAFT status after validating all business rules:
     * <ul>
     *   <li>Vehicle must exist and be AVAILABLE</li>
     *   <li>Driver must exist and be AVAILABLE</li>
     *   <li>Driver's license must not be expired</li>
     *   <li>Driver must not be SUSPENDED</li>
     *   <li>Cargo weight must not exceed vehicle's max load capacity</li>
     * </ul>
     */
    public TripResponse createTrip(TripRequest request) {
        Vehicle vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());
        Driver driver = driverService.findDriverOrThrow(request.getDriverId());

        // ── Validation 1: Cargo weight ≤ Vehicle max load capacity ──
        if (request.getCargoWeight().compareTo(vehicle.getMaxLoadCapacity()) > 0) {
            throw new ValidationException(
                    String.format("Cargo weight (%.2f kg) exceeds vehicle '%s' max load capacity (%.2f kg)",
                            request.getCargoWeight(), vehicle.getRegistrationNumber(), vehicle.getMaxLoadCapacity()));
        }

        // ── Validation 2: Driver license not expired ────────────────
        if (driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new ValidationException(
                    String.format("Driver '%s' has an expired license (expired on %s)",
                            driver.getName(), driver.getLicenseExpiryDate()));
        }

        // ── Validation 2b: Driver not SUSPENDED ─────────────────────
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            throw new ValidationException(
                    String.format("Driver '%s' is currently SUSPENDED and cannot be assigned to a trip",
                            driver.getName()));
        }

        // ── Validation 3: Vehicle must be AVAILABLE ─────────────────
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new ValidationException(
                    String.format("Vehicle '%s' is not AVAILABLE (current status: %s)",
                            vehicle.getRegistrationNumber(), vehicle.getStatus()));
        }

        // ── Validation 3b: Driver must be AVAILABLE ─────────────────
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new ValidationException(
                    String.format("Driver '%s' is not AVAILABLE (current status: %s)",
                            driver.getName(), driver.getStatus()));
        }

        Trip trip = Trip.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .cargoWeight(request.getCargoWeight())
                .plannedDistance(request.getPlannedDistance())
                .vehicle(vehicle)
                .driver(driver)
                .status(TripStatus.DRAFT)
                .build();

        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    // ── Read ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        Trip trip = findTripOrThrow(id);
        return mapToResponse(trip);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getTripsByStatus(TripStatus status) {
        return tripRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── State Transition 1: DRAFT → DISPATCHED ───────────────────────────

    /**
     * Dispatches a trip. Re-validates availability at dispatch time,
     * then atomically transitions Vehicle and Driver to ON_TRIP.
     */
    public TripResponse dispatchTrip(Long id) {
        Trip trip = findTripOrThrow(id);

        if (trip.getStatus() != TripStatus.DRAFT) {
            throw new IllegalStateTransitionException("Trip", trip.getStatus().name(), TripStatus.DISPATCHED.name());
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // Re-validate at dispatch time (another trip may have claimed them)
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new ValidationException(
                    String.format("Vehicle '%s' is no longer AVAILABLE (current status: %s)",
                            vehicle.getRegistrationNumber(), vehicle.getStatus()));
        }
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new ValidationException(
                    String.format("Driver '%s' is no longer AVAILABLE (current status: %s)",
                            driver.getName(), driver.getStatus()));
        }
        if (driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new ValidationException(
                    String.format("Driver '%s' has an expired license (expired on %s)",
                            driver.getName(), driver.getLicenseExpiryDate()));
        }

        // State Transition 1: Vehicle & Driver → ON_TRIP
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);
        trip.setStatus(TripStatus.DISPATCHED);

        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    // ── State Transition 2a: DISPATCHED → COMPLETED ──────────────────────

    /**
     * Completes a dispatched trip. Vehicle and Driver revert to AVAILABLE.
     */
    public TripResponse completeTrip(Long id) {
        Trip trip = findTripOrThrow(id);

        if (trip.getStatus() != TripStatus.DISPATCHED) {
            throw new IllegalStateTransitionException("Trip", trip.getStatus().name(), TripStatus.COMPLETED.name());
        }

        // State Transition 2: Vehicle & Driver → AVAILABLE
        trip.getVehicle().setStatus(VehicleStatus.AVAILABLE);
        trip.getDriver().setStatus(DriverStatus.AVAILABLE);
        trip.setStatus(TripStatus.COMPLETED);

        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    // ── State Transition 2b: DRAFT/DISPATCHED → CANCELLED ────────────────

    /**
     * Cancels a trip. If the trip was DISPATCHED, Vehicle and Driver
     * revert to AVAILABLE. A DRAFT trip can also be cancelled.
     */
    public TripResponse cancelTrip(Long id) {
        Trip trip = findTripOrThrow(id);

        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new IllegalStateTransitionException("Trip", trip.getStatus().name(), TripStatus.CANCELLED.name());
        }

        // If dispatched, release the vehicle and driver
        if (trip.getStatus() == TripStatus.DISPATCHED) {
            trip.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            trip.getDriver().setStatus(DriverStatus.AVAILABLE);
        }

        trip.setStatus(TripStatus.CANCELLED);
        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    private Trip findTripOrThrow(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
    }

    private TripResponse mapToResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .source(trip.getSource())
                .destination(trip.getDestination())
                .cargoWeight(trip.getCargoWeight())
                .plannedDistance(trip.getPlannedDistance())
                .status(trip.getStatus())
                .vehicleId(trip.getVehicle().getId())
                .vehicleRegistrationNumber(trip.getVehicle().getRegistrationNumber())
                .vehicleModel(trip.getVehicle().getModel())
                .driverId(trip.getDriver().getId())
                .driverName(trip.getDriver().getName())
                .driverLicenseNumber(trip.getDriver().getLicenseNumber())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }
}
