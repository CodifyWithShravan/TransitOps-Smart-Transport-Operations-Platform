package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    /**
     * Count trips by status. Used for dashboard KPIs.
     */
    long countByStatus(TripStatus status);

    /**
     * Sum of planned distances for completed trips of a specific vehicle.
     * Used for fuel efficiency calculation.
     */
    @Query("SELECT COALESCE(SUM(t.plannedDistance), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    BigDecimal sumPlannedDistanceByVehicleIdAndCompleted(@Param("vehicleId") Long vehicleId);

    /**
     * Count of completed trips for a specific vehicle. Used for analytics.
     */
    long countByVehicleIdAndStatus(Long vehicleId, TripStatus status);
}
