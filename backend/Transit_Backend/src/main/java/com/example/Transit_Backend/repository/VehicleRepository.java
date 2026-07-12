package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Vehicle} entities.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find a vehicle by its unique registration number.
     */
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    /**
     * Check whether a registration number is already in use.
     */
    boolean existsByRegistrationNumber(String registrationNumber);

    /**
     * Find all vehicles with a given operational status.
     * Useful for listing available vehicles during trip creation.
     */
    List<Vehicle> findByStatus(VehicleStatus status);
}
