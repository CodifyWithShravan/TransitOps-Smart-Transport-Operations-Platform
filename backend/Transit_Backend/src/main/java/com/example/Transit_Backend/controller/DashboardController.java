package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.response.DashboardResponse;
import com.example.Transit_Backend.dto.response.VehicleAnalyticsResponse;
import com.example.Transit_Backend.service.CsvExportService;
import com.example.Transit_Backend.service.DashboardService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * REST controller for Dashboard KPIs, Analytics, and CSV exports.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CsvExportService csvExportService;

    // ── KPI Dashboard ────────────────────────────────────────────────────

    /**
     * Returns a snapshot of all fleet, trip, and driver KPIs.
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardKPIs());
    }

    // ── Vehicle Analytics ────────────────────────────────────────────────

    /**
     * Returns per-vehicle analytics (cost breakdown, efficiency, ROI) for all vehicles.
     */
    @GetMapping("/analytics/vehicles")
    public ResponseEntity<List<VehicleAnalyticsResponse>> getAllVehicleAnalytics() {
        return ResponseEntity.ok(dashboardService.getAllVehicleAnalytics());
    }

    /**
     * Returns analytics for a single vehicle.
     */
    @GetMapping("/analytics/vehicles/{vehicleId}")
    public ResponseEntity<VehicleAnalyticsResponse> getVehicleAnalytics(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(dashboardService.getVehicleAnalytics(vehicleId));
    }

    // ── CSV Exports ──────────────────────────────────────────────────────

    @GetMapping("/export/vehicles")
    public void exportVehiclesCsv(HttpServletResponse response) throws IOException {
        setCsvHeaders(response, "vehicles_export.csv");
        csvExportService.exportVehicles(response.getWriter());
    }

    @GetMapping("/export/drivers")
    public void exportDriversCsv(HttpServletResponse response) throws IOException {
        setCsvHeaders(response, "drivers_export.csv");
        csvExportService.exportDrivers(response.getWriter());
    }

    @GetMapping("/export/trips")
    public void exportTripsCsv(HttpServletResponse response) throws IOException {
        setCsvHeaders(response, "trips_export.csv");
        csvExportService.exportTrips(response.getWriter());
    }

    @GetMapping("/export/analytics")
    public void exportAnalyticsCsv(HttpServletResponse response) throws IOException {
        setCsvHeaders(response, "vehicle_analytics_export.csv");
        csvExportService.exportVehicleAnalytics(response.getWriter());
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private void setCsvHeaders(HttpServletResponse response, String filename) {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
    }
}
