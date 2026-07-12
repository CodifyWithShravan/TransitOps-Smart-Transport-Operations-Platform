package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.Expense;
import com.example.Transit_Backend.model.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Expense} entities.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByVehicleId(Long vehicleId);

    List<Expense> findByTripId(Long tripId);

    List<Expense> findByCategory(ExpenseCategory category);

    /**
     * Sum of all expenses for a specific vehicle.
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.vehicle.id = :vehicleId")
    BigDecimal sumAmountByVehicleId(@Param("vehicleId") Long vehicleId);

    /**
     * Sum of expenses by category for a specific vehicle.
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.vehicle.id = :vehicleId AND e.category = :category")
    BigDecimal sumAmountByVehicleIdAndCategory(@Param("vehicleId") Long vehicleId, @Param("category") ExpenseCategory category);
}
