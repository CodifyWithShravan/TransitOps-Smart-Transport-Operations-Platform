package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.DriverRequest;
import com.example.Transit_Backend.dto.response.DriverResponse;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.Driver;
import com.example.Transit_Backend.model.enums.DriverStatus;
import com.example.Transit_Backend.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service layer for Driver CRUD and status management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;

    // ── CRUD ─────────────────────────────────────────────────────────────

    public DriverResponse createDriver(DriverRequest request) {
        // Business Rule: license number must be unique
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new ValidationException(
                    "Driver with license number '" + request.getLicenseNumber() + "' already exists");
        }

        Driver driver = Driver.builder()
                .name(request.getName())
                .licenseNumber(request.getLicenseNumber())
                .licenseCategory(request.getLicenseCategory())
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .contact(request.getContact())
                .safetyScore(request.getSafetyScore() != null
                        ? request.getSafetyScore()
                        : new BigDecimal("100.00"))
                .status(DriverStatus.AVAILABLE)
                .build();

        Driver saved = driverRepository.save(driver);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = findDriverOrThrow(id);
        return mapToResponse(driver);
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = findDriverOrThrow(id);

        // If license number changed, check uniqueness
        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())
                && driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new ValidationException(
                    "Driver with license number '" + request.getLicenseNumber() + "' already exists");
        }

        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseCategory(request.getLicenseCategory());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setContact(request.getContact());
        if (request.getSafetyScore() != null) {
            driver.setSafetyScore(request.getSafetyScore());
        }

        Driver updated = driverRepository.save(driver);
        return mapToResponse(updated);
    }

    public void deleteDriver(Long id) {
        Driver driver = findDriverOrThrow(id);
        driverRepository.delete(driver);
    }

    // ── Status management ────────────────────────────────────────────────

    public DriverResponse updateDriverStatus(Long id, DriverStatus newStatus) {
        Driver driver = findDriverOrThrow(id);
        driver.setStatus(newStatus);
        Driver updated = driverRepository.save(driver);
        return mapToResponse(updated);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    public Driver findDriverOrThrow(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .licenseNumber(driver.getLicenseNumber())
                .licenseCategory(driver.getLicenseCategory())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .contact(driver.getContact())
                .safetyScore(driver.getSafetyScore())
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
