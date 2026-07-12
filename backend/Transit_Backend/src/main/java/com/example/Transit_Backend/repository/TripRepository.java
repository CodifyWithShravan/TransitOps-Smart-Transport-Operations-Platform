package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Trip} entities.
 */
@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    /**
     * Find all trips with a given status.
     */
    List<Trip> findByStatus(TripStatus status);

    /**
     * Find all trips assigned to a specific vehicle.
     */
    List<Trip> findByVehicleId(Long vehicleId);

    /**
     * Find all trips assigned to a specific driver.
     */
    List<Trip> findByDriverId(Long driverId);
}
