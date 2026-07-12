package com.example.Transit_Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for the main dashboard KPIs.
 *
 * <p>Provides a single-request snapshot of fleet health, trip status,
 * driver availability, and overall utilization.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    // ── Vehicle KPIs ─────────────────────────────────────────────────────
    private long totalVehicles;
    private long availableVehicles;
    private long activeVehicles;          // ON_TRIP
    private long vehiclesInMaintenance;   // IN_SHOP
    private long retiredVehicles;

    // ── Trip KPIs ────────────────────────────────────────────────────────
    private long totalTrips;
    private long pendingTrips;            // DRAFT
    private long activeTrips;             // DISPATCHED
    private long completedTrips;
    private long cancelledTrips;

    // ── Driver KPIs ──────────────────────────────────────────────────────
    private long totalDrivers;
    private long availableDrivers;
    private long driversOnDuty;           // ON_TRIP
    private long driversOffDuty;
    private long suspendedDrivers;

    // ── Computed KPIs ────────────────────────────────────────────────────

    /**
     * Fleet Utilization (%) = (Vehicles ON_TRIP / Operational Vehicles) × 100.
     * Operational vehicles = total − retired.
     */
    private BigDecimal fleetUtilization;

    /**
     * Total fuel cost across all vehicles.
     */
    private BigDecimal totalFuelCost;

    /**
     * Total maintenance cost across all vehicles.
     */
    private BigDecimal totalMaintenanceCost;

    /**
     * Total operational cost = fuel + maintenance + other expenses.
     */
    private BigDecimal totalOperationalCost;
}
