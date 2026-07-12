package com.example.Transit_Backend.model;

import com.example.Transit_Backend.model.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a vehicle in the transport fleet.
 *
 * <p>Tracks registration details, physical attributes, financial data,
 * and real-time operational status used for trip assignment and
 * maintenance workflows.</p>
 */
@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicle_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique government-issued registration number (e.g., "KA-01-AB-1234").
     */
    @Column(nullable = false, unique = true, length = 50)
    private String registrationNumber;

    /**
     * Make and model of the vehicle (e.g., "Tata Prima 4928.S").
     */
    @Column(nullable = false, length = 100)
    private String model;

    /**
     * Type/category of the vehicle (e.g., "Truck", "Van", "Bus").
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Maximum cargo load capacity in kilograms.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxLoadCapacity;

    /**
     * Current odometer reading in kilometres.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal odometer;

    /**
     * Original acquisition cost of the vehicle.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal acquisitionCost;

    /**
     * Current operational status of the vehicle.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

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
