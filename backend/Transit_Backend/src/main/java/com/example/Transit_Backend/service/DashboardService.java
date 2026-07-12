package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.response.DashboardResponse;
import com.example.Transit_Backend.dto.response.VehicleAnalyticsResponse;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.DriverStatus;
import com.example.Transit_Backend.model.enums.TripStatus;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service layer for dashboard KPIs and per-vehicle analytics.
 *
 * <p>Aggregates data across Vehicles, Drivers, Trips, Fuel Logs,
 * Maintenance Logs, and Expenses to produce operational insights.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ExpenseRepository expenseRepository;

    // ── Dashboard KPIs ───────────────────────────────────────────────────

    public DashboardResponse getDashboardKPIs() {

        // Vehicle counts
        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long activeVehicles = vehicleRepository.countByStatus(VehicleStatus.ON_TRIP);
        long vehiclesInMaintenance = vehicleRepository.countByStatus(VehicleStatus.IN_SHOP);
        long retiredVehicles = vehicleRepository.countByStatus(VehicleStatus.RETIRED);

        // Trip counts
        long totalTrips = tripRepository.count();
        long pendingTrips = tripRepository.countByStatus(TripStatus.DRAFT);
        long activeTrips = tripRepository.countByStatus(TripStatus.DISPATCHED);
        long completedTrips = tripRepository.countByStatus(TripStatus.COMPLETED);
        long cancelledTrips = tripRepository.countByStatus(TripStatus.CANCELLED);

        // Driver counts
        long totalDrivers = driverRepository.count();
        long availableDrivers = driverRepository.countByStatus(DriverStatus.AVAILABLE);
        long driversOnDuty = driverRepository.countByStatus(DriverStatus.ON_TRIP);
        long driversOffDuty = driverRepository.countByStatus(DriverStatus.OFF_DUTY);
        long suspendedDrivers = driverRepository.countByStatus(DriverStatus.SUSPENDED);

        // Fleet utilization: (ON_TRIP / operational) × 100
        long operationalVehicles = totalVehicles - retiredVehicles;
        BigDecimal fleetUtilization = BigDecimal.ZERO;
        if (operationalVehicles > 0) {
            fleetUtilization = BigDecimal.valueOf(activeVehicles)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(operationalVehicles), 2, RoundingMode.HALF_UP);
        }

        // Cost aggregations (across all vehicles)
        BigDecimal totalFuelCost = fuelLogRepository.findAll().stream()
                .map(f -> f.getCost())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMaintenanceCost = maintenanceLogRepository.findAll().stream()
                .map(m -> m.getCost())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpensesCost = expenseRepository.findAll().stream()
                .map(e -> e.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOperationalCost = totalFuelCost
                .add(totalMaintenanceCost)
                .add(totalExpensesCost);

        return DashboardResponse.builder()
                .totalVehicles(totalVehicles)
                .availableVehicles(availableVehicles)
                .activeVehicles(activeVehicles)
                .vehiclesInMaintenance(vehiclesInMaintenance)
                .retiredVehicles(retiredVehicles)
                .totalTrips(totalTrips)
                .pendingTrips(pendingTrips)
                .activeTrips(activeTrips)
                .completedTrips(completedTrips)
                .cancelledTrips(cancelledTrips)
                .totalDrivers(totalDrivers)
                .availableDrivers(availableDrivers)
                .driversOnDuty(driversOnDuty)
                .driversOffDuty(driversOffDuty)
                .suspendedDrivers(suspendedDrivers)
                .fleetUtilization(fleetUtilization)
                .totalFuelCost(totalFuelCost)
                .totalMaintenanceCost(totalMaintenanceCost)
                .totalOperationalCost(totalOperationalCost)
                .build();
    }

    // ── Per-vehicle analytics ────────────────────────────────────────────

    /**
     * Returns analytics for all vehicles including cost breakdown,
     * fuel efficiency, and ROI.
     */
    public List<VehicleAnalyticsResponse> getAllVehicleAnalytics() {
        return vehicleRepository.findAll().stream()
                .map(this::buildVehicleAnalytics)
                .toList();
    }

    /**
     * Returns analytics for a single vehicle.
     */
    public VehicleAnalyticsResponse getVehicleAnalytics(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new com.example.Transit_Backend.exception.ResourceNotFoundException("Vehicle", vehicleId));
        return buildVehicleAnalytics(vehicle);
    }

    // ── Internal ─────────────────────────────────────────────────────────

    private VehicleAnalyticsResponse buildVehicleAnalytics(Vehicle vehicle) {
        Long vehicleId = vehicle.getId();

        // Trip stats
        long completedTrips = tripRepository.countByVehicleIdAndStatus(vehicleId, TripStatus.COMPLETED);
        BigDecimal totalDistance = tripRepository.sumPlannedDistanceByVehicleIdAndCompleted(vehicleId);

        // Cost breakdown
        BigDecimal totalFuelCost = fuelLogRepository.sumCostByVehicleId(vehicleId);
        BigDecimal totalFuelLitres = fuelLogRepository.sumLitresByVehicleId(vehicleId);
        BigDecimal totalMaintenanceCost = maintenanceLogRepository.sumCostByVehicleId(vehicleId);
        BigDecimal totalExpenses = expenseRepository.sumAmountByVehicleId(vehicleId);
        BigDecimal totalOperationalCost = totalFuelCost.add(totalMaintenanceCost).add(totalExpenses);

        // Fuel efficiency: distance / litres (km/L)
        BigDecimal fuelEfficiency = null;
        if (totalFuelLitres.compareTo(BigDecimal.ZERO) > 0) {
            fuelEfficiency = totalDistance.divide(totalFuelLitres, 2, RoundingMode.HALF_UP);
        }

        // Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
        // Revenue tracking not yet implemented — defaults to 0
        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal vehicleROI = BigDecimal.ZERO;
        if (vehicle.getAcquisitionCost().compareTo(BigDecimal.ZERO) > 0) {
            vehicleROI = revenue
                    .subtract(totalMaintenanceCost.add(totalFuelCost))
                    .divide(vehicle.getAcquisitionCost(), 4, RoundingMode.HALF_UP);
        }

        return VehicleAnalyticsResponse.builder()
                .vehicleId(vehicleId)
                .registrationNumber(vehicle.getRegistrationNumber())
                .model(vehicle.getModel())
                .type(vehicle.getType())
                .status(vehicle.getStatus())
                .completedTrips(completedTrips)
                .totalDistance(totalDistance)
                .totalFuelCost(totalFuelCost)
                .totalFuelLitres(totalFuelLitres)
                .totalMaintenanceCost(totalMaintenanceCost)
                .totalExpenses(totalExpenses)
                .totalOperationalCost(totalOperationalCost)
                .fuelEfficiency(fuelEfficiency)
                .acquisitionCost(vehicle.getAcquisitionCost())
                .vehicleROI(vehicleROI)
                .build();
    }
}
