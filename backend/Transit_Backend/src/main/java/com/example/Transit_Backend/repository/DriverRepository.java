package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.Driver;
import com.example.Transit_Backend.model.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Driver} entities.
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    /**
     * Find a driver by their unique license number.
     */
    Optional<Driver> findByLicenseNumber(String licenseNumber);

    /**
     * Check whether a license number is already in use.
     */
    boolean existsByLicenseNumber(String licenseNumber);

    /**
     * Find all drivers with a given operational status.
     * Useful for listing available drivers during trip creation.
     */
    List<Driver> findByStatus(DriverStatus status);
}
