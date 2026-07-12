package com.example.Transit_Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a fuel consumption record.
 *
 * <p>Each log captures litres consumed, cost, and odometer reading.
 * Optionally linked to a specific {@link Trip} for per-trip
 * fuel efficiency calculations.</p>
 */
@Entity
@Table(name = "fuel_logs", indexes = {
        @Index(name = "idx_fuel_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_fuel_trip", columnList = "trip_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Vehicle that consumed the fuel.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Trip during which fuel was consumed (optional).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    /**
     * Volume of fuel consumed in litres.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal litres;

    /**
     * Total cost of the fuel.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost;

    /**
     * Odometer reading at the time of fuelling.
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal odometerReading;

    /**
     * Date of fuelling.
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
