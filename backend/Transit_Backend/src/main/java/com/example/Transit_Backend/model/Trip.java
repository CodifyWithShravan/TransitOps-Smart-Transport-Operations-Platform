package com.example.Transit_Backend.model;

import com.example.Transit_Backend.model.enums.TripStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a transport trip from source to destination.
 *
 * <p>Links a {@link Vehicle} and {@link Driver} to a cargo movement.
 * Status transitions enforce business rules around vehicle/driver
 * availability and cargo weight limits.</p>
 */
@Entity
@Table(name = "trips", indexes = {
        @Index(name = "idx_trip_status", columnList = "status"),
        @Index(name = "idx_trip_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_trip_driver", columnList = "driver_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Origin location of the trip.
     */
    @Column(nullable = false, length = 255)
    private String source;

    /**
     * Destination location of the trip.
     */
    @Column(nullable = false, length = 255)
    private String destination;

    /**
     * Weight of the cargo being transported, in kilograms.
     * Validated against the assigned vehicle's max load capacity.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cargoWeight;

    /**
     * Planned distance for the trip, in kilometres.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal plannedDistance;

    /**
     * Current lifecycle status of the trip.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TripStatus status = TripStatus.DRAFT;

    /**
     * Vehicle assigned to this trip.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Driver assigned to this trip.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

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
