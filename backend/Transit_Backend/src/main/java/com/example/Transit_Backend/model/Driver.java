package com.example.Transit_Backend.model;

import com.example.Transit_Backend.model.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a driver employed by the transport operation.
 *
 * <p>Stores license credentials, contact information, and real-time
 * availability status used for trip assignment validations.</p>
 */
@Entity
@Table(name = "drivers", indexes = {
        @Index(name = "idx_driver_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Full name of the driver.
     */
    @Column(nullable = false, length = 150)
    private String name;

    /**
     * Unique driving license number.
     */
    @Column(nullable = false, unique = true, length = 50)
    private String licenseNumber;

    /**
     * Category of the driving license (e.g., "LMV", "HMV", "HTV").
     */
    @Column(nullable = false, length = 30)
    private String licenseCategory;

    /**
     * Expiry date of the driver's license.
     * Used during trip dispatch validation.
     */
    @Column(nullable = false)
    private LocalDate licenseExpiryDate;

    /**
     * Primary contact number of the driver.
     */
    @Column(nullable = false, length = 20)
    private String contact;

    /**
     * Safety score of the driver (0–100).
     * Starts at 100 for new drivers; adjusted based on incidents.
     */
    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal safetyScore = new BigDecimal("100.00");

    /**
     * Current operational status of the driver.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DriverStatus status = DriverStatus.AVAILABLE;

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
