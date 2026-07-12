package com.example.Transit_Backend.dto.response;

import com.example.Transit_Backend.model.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Trip data sent to the client.
 * Embeds summary info for the associated Vehicle and Driver
 * to avoid additional lookups on the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {

    private Long id;
    private String source;
    private String destination;
    private BigDecimal cargoWeight;
    private BigDecimal plannedDistance;
    private TripStatus status;

    // Flattened vehicle info
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String vehicleModel;

    // Flattened driver info
    private Long driverId;
    private String driverName;
    private String driverLicenseNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
