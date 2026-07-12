package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.TripRequest;
import com.example.Transit_Backend.dto.response.TripResponse;
import com.example.Transit_Backend.model.enums.TripStatus;
import com.example.Transit_Backend.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Trip lifecycle management.
 *
 * <p>Provides endpoints for creating trips, listing/filtering trips,
 * and executing state transitions (dispatch, complete, cancel) that
 * automatically update the assigned Vehicle and Driver statuses.</p>
 */
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    // ── CREATE ────────────────────────────────────────────────────────────

    /**
     * Create a new trip in DRAFT status.
     * Validates cargo weight, driver license, and vehicle/driver availability.
     */
    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        TripResponse response = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips(
            @RequestParam(required = false) TripStatus status) {
        List<TripResponse> trips = (status != null)
                ? tripService.getTripsByStatus(status)
                : tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    // ── STATE TRANSITIONS ────────────────────────────────────────────────

    /**
     * DRAFT → DISPATCHED.
     * Re-validates availability, then sets Vehicle & Driver to ON_TRIP.
     */
    @PatchMapping("/{id}/dispatch")
    public ResponseEntity<TripResponse> dispatchTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.dispatchTrip(id));
    }

    /**
     * DISPATCHED → COMPLETED.
     * Reverts Vehicle & Driver to AVAILABLE.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripResponse> completeTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.completeTrip(id));
    }

    /**
     * DRAFT/DISPATCHED → CANCELLED.
     * If dispatched, reverts Vehicle & Driver to AVAILABLE.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripResponse> cancelTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelTrip(id));
    }
}
