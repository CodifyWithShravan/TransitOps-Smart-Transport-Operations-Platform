package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.TripRequest;
import com.example.Transit_Backend.dto.response.TripResponse;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.Driver;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.DriverStatus;
import com.example.Transit_Backend.model.enums.TripStatus;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import com.example.Transit_Backend.repository.DriverRepository;
import com.example.Transit_Backend.repository.TripRepository;
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
class TripServiceIntegrationTest {

    @Autowired
    private TripService tripService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private TripRepository tripRepository;

    private Vehicle vehicle;
    private Driver driver;

    @BeforeEach
    void setUp() {
        vehicle = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("KA-01-EQ-1234")
                .model("Volvo FH16")
                .type("Heavy Truck")
                .maxLoadCapacity(BigDecimal.valueOf(25000))
                .odometer(BigDecimal.valueOf(10000))
                .acquisitionCost(BigDecimal.valueOf(120000))
                .status(VehicleStatus.AVAILABLE)
                .build());

        driver = driverRepository.save(Driver.builder()
                .name("Rajesh Kumar")
                .licenseNumber("DL-987654321")
                .licenseCategory("Heavy Commercial")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .contact("9876543210")
                .safetyScore(BigDecimal.valueOf(95.00))
                .status(DriverStatus.AVAILABLE)
                .build());
    }

    @Test
    void testCreateTrip_Success() {
        TripRequest request = TripRequest.builder()
                .source("Bangalore")
                .destination("Mumbai")
                .cargoWeight(BigDecimal.valueOf(15000))
                .plannedDistance(BigDecimal.valueOf(980))
                .vehicleId(vehicle.getId())
                .driverId(driver.getId())
                .build();

        TripResponse response = tripService.createTrip(request);

        assertNotNull(response.getId());
        assertEquals(TripStatus.DRAFT, response.getStatus());
        assertEquals("Bangalore", response.getSource());
        assertEquals("Mumbai", response.getDestination());
    }

    @Test
    void testCreateTrip_CargoOverweight_ThrowsValidationException() {
        TripRequest request = TripRequest.builder()
                .source("Bangalore")
                .destination("Mumbai")
                .cargoWeight(BigDecimal.valueOf(30000)) // Exceeds 25000 capacity
                .plannedDistance(BigDecimal.valueOf(980))
                .vehicleId(vehicle.getId())
                .driverId(driver.getId())
                .build();

        assertThrows(ValidationException.class, () -> tripService.createTrip(request));
    }

    @Test
    void testCreateTrip_ExpiredDriverLicense_ThrowsValidationException() {
        driver.setLicenseExpiryDate(LocalDate.now().minusDays(1));
        driverRepository.save(driver);

        TripRequest request = TripRequest.builder()
                .source("Bangalore")
                .destination("Mumbai")
                .cargoWeight(BigDecimal.valueOf(10000))
                .plannedDistance(BigDecimal.valueOf(980))
                .vehicleId(vehicle.getId())
                .driverId(driver.getId())
                .build();

        assertThrows(ValidationException.class, () -> tripService.createTrip(request));
    }

    @Test
    void testDispatchAndCompleteTrip_StateTransitions() {
        TripRequest request = TripRequest.builder()
                .source("Bangalore")
                .destination("Chennai")
                .cargoWeight(BigDecimal.valueOf(12000))
                .plannedDistance(BigDecimal.valueOf(350))
                .vehicleId(vehicle.getId())
                .driverId(driver.getId())
                .build();

        TripResponse created = tripService.createTrip(request);
        assertEquals(TripStatus.DRAFT, created.getStatus());

        // Dispatch Trip -> Vehicle & Driver become ON_TRIP
        TripResponse dispatched = tripService.dispatchTrip(created.getId());
        assertEquals(TripStatus.DISPATCHED, dispatched.getStatus());

        Vehicle updatedVehicle = vehicleRepository.findById(vehicle.getId()).orElseThrow();
        Driver updatedDriver = driverRepository.findById(driver.getId()).orElseThrow();

        assertEquals(VehicleStatus.ON_TRIP, updatedVehicle.getStatus());
        assertEquals(DriverStatus.ON_TRIP, updatedDriver.getStatus());

        // Complete Trip -> Vehicle & Driver become AVAILABLE
        TripResponse completed = tripService.completeTrip(created.getId());
        assertEquals(TripStatus.COMPLETED, completed.getStatus());

        updatedVehicle = vehicleRepository.findById(vehicle.getId()).orElseThrow();
        updatedDriver = driverRepository.findById(driver.getId()).orElseThrow();

        assertEquals(VehicleStatus.AVAILABLE, updatedVehicle.getStatus());
        assertEquals(DriverStatus.AVAILABLE, updatedDriver.getStatus());
    }
}
