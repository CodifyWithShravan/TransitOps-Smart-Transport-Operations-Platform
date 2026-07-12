package com.example.Transit_Backend.dto.response;

import com.example.Transit_Backend.model.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for per-vehicle analytics.
 *
 * <p>Provides operational cost breakdown, fuel efficiency,
 * and ROI calculation for a single vehicle.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleAnalyticsResponse {

    // ── Vehicle identity ─────────────────────────────────────────────────
    private Long vehicleId;
    private String registrationNumber;
    private String model;
    private String type;
    private VehicleStatus status;

    // ── Trip stats ───────────────────────────────────────────────────────
    private long completedTrips;
    private BigDecimal totalDistance;         // Sum of planned distances (completed)

    // ── Cost breakdown ───────────────────────────────────────────────────
    private BigDecimal totalFuelCost;
    private BigDecimal totalFuelLitres;
    private BigDecimal totalMaintenanceCost;
    private BigDecimal totalExpenses;         // from Expense table
    private BigDecimal totalOperationalCost;  // fuel + maintenance + expenses

    // ── Efficiency metrics ───────────────────────────────────────────────

    /**
     * Fuel Efficiency = Total Distance / Total Fuel Litres (km/litre).
     * Null if no fuel data exists.
     */
    private BigDecimal fuelEfficiency;

    // ── Financial metrics ────────────────────────────────────────────────
    private BigDecimal acquisitionCost;

    /**
     * Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
     * Revenue defaults to 0 until revenue tracking is implemented.
     */
    private BigDecimal vehicleROI;
}
