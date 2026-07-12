package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for {@link FuelLog} entities.
 */
@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {

    List<FuelLog> findByVehicleId(Long vehicleId);

    List<FuelLog> findByTripId(Long tripId);

    /**
     * Sum of all fuel costs for a specific vehicle.
     */
    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(@Param("vehicleId") Long vehicleId);

    /**
     * Sum of all litres consumed by a specific vehicle.
     */
    @Query("SELECT COALESCE(SUM(f.litres), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumLitresByVehicleId(@Param("vehicleId") Long vehicleId);
}
