package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.MaintenanceLogRequest;
import com.example.Transit_Backend.dto.response.MaintenanceLogResponse;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MaintenanceServiceIntegrationTest {

    @Autowired
    private MaintenanceLogService maintenanceLogService;

    @Autowired
    private VehicleRepository vehicleRepository;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("DL-01-AB-9999")
                .model("Tata Signo")
                .type("Flatbed")
                .maxLoadCapacity(BigDecimal.valueOf(18000))
                .odometer(BigDecimal.valueOf(45000))
                .acquisitionCost(BigDecimal.valueOf(85000))
                .status(VehicleStatus.AVAILABLE)
                .build());
    }

    @Test
    void testCreateAndCloseMaintenanceLog_StateTransitions() {
        MaintenanceLogRequest request = MaintenanceLogRequest.builder()
                .vehicleId(vehicle.getId())
                .maintenanceType("Preventive Service")
                .description("Engine oil change and brake inspection")
                .cost(BigDecimal.valueOf(450.00))
                .startDate(LocalDate.now())
                .build();

        // Create open maintenance log -> Vehicle status becomes IN_SHOP
        MaintenanceLogResponse created = maintenanceLogService.createMaintenanceLog(request);

        assertNotNull(created.getId());
        assertEquals(MaintenanceStatus.OPEN, created.getStatus());

        Vehicle updatedVehicle = vehicleRepository.findById(vehicle.getId()).orElseThrow();
        assertEquals(VehicleStatus.IN_SHOP, updatedVehicle.getStatus());

        // Close maintenance log -> Vehicle status reverts to AVAILABLE
        MaintenanceLogResponse closed = maintenanceLogService.closeMaintenanceLog(created.getId());

        assertEquals(MaintenanceStatus.CLOSED, closed.getStatus());

        updatedVehicle = vehicleRepository.findById(vehicle.getId()).orElseThrow();
        assertEquals(VehicleStatus.AVAILABLE, updatedVehicle.getStatus());
    }

    @Test
    void testCreateMaintenanceForVehicleOnTrip_ThrowsValidationException() {
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        vehicleRepository.save(vehicle);

        MaintenanceLogRequest request = MaintenanceLogRequest.builder()
                .vehicleId(vehicle.getId())
                .maintenanceType("Emergency Repair")
                .description("Tire change")
                .cost(BigDecimal.valueOf(120.00))
                .startDate(LocalDate.now())
                .build();

        assertThrows(ValidationException.class, () -> maintenanceLogService.createMaintenanceLog(request));
    }
}
