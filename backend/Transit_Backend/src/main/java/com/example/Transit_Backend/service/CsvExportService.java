package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.response.VehicleAnalyticsResponse;
import com.example.Transit_Backend.model.Driver;
import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.repository.DriverRepository;
import com.example.Transit_Backend.repository.TripRepository;
import com.example.Transit_Backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.util.List;

/**
 * Service for exporting data as CSV.
 *
 * <p>Writes CSV content directly to a {@link PrintWriter} (typically
 * obtained from {@code HttpServletResponse.getWriter()}) to avoid
 * loading the full CSV string into memory.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CsvExportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final DashboardService dashboardService;

    // ── Vehicles CSV ─────────────────────────────────────────────────────

    public void exportVehicles(PrintWriter writer) {
        writer.println("ID,Registration Number,Model,Type,Max Load Capacity,Odometer,Acquisition Cost,Status,Created At");
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    v.getId(),
                    escapeCsv(v.getRegistrationNumber()),
                    escapeCsv(v.getModel()),
                    escapeCsv(v.getType()),
                    v.getMaxLoadCapacity(),
                    v.getOdometer(),
                    v.getAcquisitionCost(),
                    v.getStatus(),
                    v.getCreatedAt());
        }
        writer.flush();
    }

    // ── Drivers CSV ──────────────────────────────────────────────────────

    public void exportDrivers(PrintWriter writer) {
        writer.println("ID,Name,License Number,License Category,License Expiry Date,Contact,Safety Score,Status,Created At");
        List<Driver> drivers = driverRepository.findAll();
        for (Driver d : drivers) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    d.getId(),
                    escapeCsv(d.getName()),
                    escapeCsv(d.getLicenseNumber()),
                    escapeCsv(d.getLicenseCategory()),
                    d.getLicenseExpiryDate(),
                    escapeCsv(d.getContact()),
                    d.getSafetyScore(),
                    d.getStatus(),
                    d.getCreatedAt());
        }
        writer.flush();
    }

    // ── Trips CSV ────────────────────────────────────────────────────────

    public void exportTrips(PrintWriter writer) {
        writer.println("ID,Source,Destination,Cargo Weight,Planned Distance,Status,Vehicle ID,Vehicle Reg,Driver ID,Driver Name,Created At");
        List<Trip> trips = tripRepository.findAll();
        for (Trip t : trips) {
            writer.printf("%d,%s,%s,%s,%s,%s,%d,%s,%d,%s,%s%n",
                    t.getId(),
                    escapeCsv(t.getSource()),
                    escapeCsv(t.getDestination()),
                    t.getCargoWeight(),
                    t.getPlannedDistance(),
                    t.getStatus(),
                    t.getVehicle().getId(),
                    escapeCsv(t.getVehicle().getRegistrationNumber()),
                    t.getDriver().getId(),
                    escapeCsv(t.getDriver().getName()),
                    t.getCreatedAt());
        }
        writer.flush();
    }

    // ── Vehicle Analytics CSV ────────────────────────────────────────────

    public void exportVehicleAnalytics(PrintWriter writer) {
        writer.println("Vehicle ID,Registration Number,Model,Type,Status,Completed Trips,Total Distance (km),"
                + "Fuel Cost,Fuel Litres,Maintenance Cost,Other Expenses,Total Operational Cost,"
                + "Fuel Efficiency (km/L),Acquisition Cost,Vehicle ROI");
        List<VehicleAnalyticsResponse> analytics = dashboardService.getAllVehicleAnalytics();
        for (VehicleAnalyticsResponse a : analytics) {
            writer.printf("%d,%s,%s,%s,%s,%d,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    a.getVehicleId(),
                    escapeCsv(a.getRegistrationNumber()),
                    escapeCsv(a.getModel()),
                    escapeCsv(a.getType()),
                    a.getStatus(),
                    a.getCompletedTrips(),
                    a.getTotalDistance(),
                    a.getTotalFuelCost(),
                    a.getTotalFuelLitres(),
                    a.getTotalMaintenanceCost(),
                    a.getTotalExpenses(),
                    a.getTotalOperationalCost(),
                    a.getFuelEfficiency() != null ? a.getFuelEfficiency() : "N/A",
                    a.getAcquisitionCost(),
                    a.getVehicleROI());
        }
        writer.flush();
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Escapes CSV values that contain commas, quotes, or newlines.
     */
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
