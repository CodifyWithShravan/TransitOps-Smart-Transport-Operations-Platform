package com.example.Transit_Backend.model;

import com.example.Transit_Backend.model.enums.ExpenseCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing an operational expense.
 *
 * <p>Captures tolls, insurance, penalties, and other costs that
 * are not covered by fuel logs or maintenance logs. Optionally
 * linked to a specific {@link Vehicle} and/or {@link Trip}.</p>
 */
@Entity
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expense_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_expense_trip", columnList = "trip_id"),
        @Index(name = "idx_expense_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Vehicle this expense is associated with (optional).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    /**
     * Trip this expense is associated with (optional).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    /**
     * Category of the expense.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseCategory category;

    /**
     * Short description of the expense.
     */
    @Column(nullable = false, length = 255)
    private String description;

    /**
     * Monetary amount of the expense.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /**
     * Date the expense was incurred.
     */
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
