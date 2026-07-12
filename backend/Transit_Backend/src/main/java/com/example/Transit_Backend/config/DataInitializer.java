package com.example.Transit_Backend.config;

import com.example.Transit_Backend.model.*;
import com.example.Transit_Backend.model.enums.*;
import com.example.Transit_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Automatically seeds sample users, vehicles, drivers, trips, fuel logs, maintenance logs,
 * and expenses on startup if the database is empty.
 *
 * <p>Ideal for frontend prototyping and immediate dashboard KPI visualization.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ExpenseRepository expenseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0 || vehicleRepository.count() > 0) {
            log.info("Database already contains data — skipping sample data initialization.");
            return;
        }

        log.info("Seeding TransitOps sample data for frontend developers & testing...");

        // 1. Seed Users (all passwords are 'password123')
        User admin = userRepository.save(User.builder()
                .name("System Admin")
                .email("admin@transitops.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .build());

        User manager = userRepository.save(User.builder()
                .name("Vikram Fleet Manager")
                .email("manager@transitops.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.FLEET_MANAGER)
                .build());

        User dispatcher = userRepository.save(User.builder()
                .name("Priya Dispatcher")
                .email("dispatcher@transitops.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.DISPATCHER)
                .build());

        User safety = userRepository.save(User.builder()
                .name("Anand Safety Officer")
                .email("safety@transitops.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.SAFETY_OFFICER)
                .build());

        User finance = userRepository.save(User.builder()
                .name("Neha Financial Analyst")
                .email("finance@transitops.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.FINANCIAL_ANALYST)
                .build());

        // 2. Seed Vehicles
        Vehicle truck1 = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("KA-01-EQ-1001")
                .model("Volvo FH16 540")
                .type("Heavy Trailer")
                .maxLoadCapacity(BigDecimal.valueOf(30000))
                .odometer(BigDecimal.valueOf(85400))
                .acquisitionCost(BigDecimal.valueOf(140000))
                .status(VehicleStatus.AVAILABLE)
                .build());

        Vehicle truck2 = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("MH-12-AB-2002")
                .model("Tata Prima 3530.K")
                .type("Tipper Truck")
                .maxLoadCapacity(BigDecimal.valueOf(25000))
                .odometer(BigDecimal.valueOf(42100))
                .acquisitionCost(BigDecimal.valueOf(95000))
                .status(VehicleStatus.ON_TRIP)
                .build());

        Vehicle truck3 = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("DL-04-XY-3003")
                .model("Ashok Leyland Signa")
                .type("Container Truck")
                .maxLoadCapacity(BigDecimal.valueOf(20000))
                .odometer(BigDecimal.valueOf(112000))
                .acquisitionCost(BigDecimal.valueOf(88000))
                .status(VehicleStatus.IN_SHOP)
                .build());

        Vehicle van1 = vehicleRepository.save(Vehicle.builder()
                .registrationNumber("TN-09-CD-4004")
                .model("Mahindra Furio 16")
                .type("Refrigerated Van")
                .maxLoadCapacity(BigDecimal.valueOf(10000))
                .odometer(BigDecimal.valueOf(23500))
                .acquisitionCost(BigDecimal.valueOf(65000))
                .status(VehicleStatus.AVAILABLE)
                .build());

        // 3. Seed Drivers
        Driver driver1 = driverRepository.save(Driver.builder()
                .name("Ramesh Sharma")
                .licenseNumber("DL-1122334455")
                .licenseCategory("Heavy Commercial")
                .licenseExpiryDate(LocalDate.now().plusYears(4))
                .contact("+91-9876543210")
                .safetyScore(BigDecimal.valueOf(96.50))
                .status(DriverStatus.AVAILABLE)
                .build());

        Driver driver2 = driverRepository.save(Driver.builder()
                .name("Suresh Patil")
                .licenseNumber("MH-5544332211")
                .licenseCategory("Heavy Commercial")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .contact("+91-9823012345")
                .safetyScore(BigDecimal.valueOf(92.00))
                .status(DriverStatus.ON_TRIP)
                .build());

        Driver driver3 = driverRepository.save(Driver.builder()
                .name("Amit Verma")
                .licenseNumber("KA-9988776655")
                .licenseCategory("Light Commercial")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .contact("+91-9811122233")
                .safetyScore(BigDecimal.valueOf(88.50))
                .status(DriverStatus.AVAILABLE)
                .build());

        // 4. Seed Trips
        Trip completedTrip1 = tripRepository.save(Trip.builder()
                .source("Bangalore")
                .destination("Hyderabad")
                .cargoWeight(BigDecimal.valueOf(18000))
                .plannedDistance(BigDecimal.valueOf(570))
                .vehicle(truck1)
                .driver(driver1)
                .status(TripStatus.COMPLETED)
                .build());

        Trip activeTrip = tripRepository.save(Trip.builder()
                .source("Mumbai")
                .destination("Pune")
                .cargoWeight(BigDecimal.valueOf(22000))
                .plannedDistance(BigDecimal.valueOf(150))
                .vehicle(truck2)
                .driver(driver2)
                .status(TripStatus.DISPATCHED)
                .build());

        Trip draftTrip = tripRepository.save(Trip.builder()
                .source("Chennai")
                .destination("Coimbatore")
                .cargoWeight(BigDecimal.valueOf(8500))
                .plannedDistance(BigDecimal.valueOf(500))
                .vehicle(van1)
                .driver(driver3)
                .status(TripStatus.DRAFT)
                .build());

        // 5. Seed Fuel Logs
        fuelLogRepository.save(FuelLog.builder()
                .vehicle(truck1)
                .trip(completedTrip1)
                .litres(BigDecimal.valueOf(180.5))
                .cost(BigDecimal.valueOf(17147.50))
                .odometerReading(BigDecimal.valueOf(85400))
                .date(LocalDate.now().minusDays(5))
                .build());

        fuelLogRepository.save(FuelLog.builder()
                .vehicle(truck2)
                .trip(activeTrip)
                .litres(BigDecimal.valueOf(65.0))
                .cost(BigDecimal.valueOf(6175.00))
                .odometerReading(BigDecimal.valueOf(42100))
                .date(LocalDate.now().minusDays(1))
                .build());

        // 6. Seed Maintenance Logs
        maintenanceLogRepository.save(MaintenanceLog.builder()
                .vehicle(truck3)
                .maintenanceType("Brake Overhaul & Fluid Exchange")
                .description("Replacing front brake pads and hydraulic lines")
                .cost(BigDecimal.valueOf(24500.00))
                .startDate(LocalDate.now().minusDays(2))
                .status(MaintenanceStatus.OPEN)
                .build());

        // 7. Seed Expenses
        expenseRepository.save(Expense.builder()
                .vehicle(truck1)
                .trip(completedTrip1)
                .category(ExpenseCategory.TOLL)
                .description("National Highway FASTag Tolls")
                .amount(BigDecimal.valueOf(1850.00))
                .date(LocalDate.now().minusDays(5))
                .build());

        expenseRepository.save(Expense.builder()
                .vehicle(truck2)
                .trip(activeTrip)
                .category(ExpenseCategory.PARKING)
                .description("Logistics Park Terminal Parking")
                .amount(BigDecimal.valueOf(450.00))
                .date(LocalDate.now().minusDays(1))
                .build());

        log.info("Successfully seeded TransitOps sample database!");
    }
}
