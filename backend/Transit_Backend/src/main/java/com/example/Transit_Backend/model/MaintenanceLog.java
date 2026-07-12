package com.example.Transit_Backend.model;

import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a maintenance record for a vehicle.
 *
 * <p>Opening a maintenance log automatically puts the associated vehicle
 * {@code IN_SHOP}. Closing it reverts the vehicle to {@code AVAILABLE}
 * (unless the vehicle is {@code RETIRED}).</p>
 */
@Entity
@Table(name = "maintenance_logs", indexes = {
        @Index(name = "idx_maintenance_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_maintenance_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Vehicle undergoing maintenance.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Type of maintenance (e.g., "Oil Change", "Brake Repair", "Tyre Replacement").
     */
    @Column(nullable = false, length = 100)
    private String maintenanceType;

    /**
     * Detailed description of the maintenance work.
     */
    @Column(length = 500)
    private String description;

    /**
     * Cost of the maintenance work.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost;

    /**
     * Date when maintenance started.
     */
    @Column(nullable = false)
    private LocalDate startDate;

    /**
     * Date when maintenance was completed. Null while status is OPEN.
     */
    private LocalDate endDate;

    /**
     * Current status of this maintenance record.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.OPEN;

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
