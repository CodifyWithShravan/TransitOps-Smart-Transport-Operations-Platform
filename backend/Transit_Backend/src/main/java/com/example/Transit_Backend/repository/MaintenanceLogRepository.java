package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.MaintenanceLog;
import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for {@link MaintenanceLog} entities.
 */
@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    List<MaintenanceLog> findByVehicleId(Long vehicleId);

    List<MaintenanceLog> findByVehicleIdAndStatus(Long vehicleId, MaintenanceStatus status);

    List<MaintenanceLog> findByStatus(MaintenanceStatus status);

    /**
     * Sum of all maintenance costs for a specific vehicle.
     */
    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(@Param("vehicleId") Long vehicleId);
}
