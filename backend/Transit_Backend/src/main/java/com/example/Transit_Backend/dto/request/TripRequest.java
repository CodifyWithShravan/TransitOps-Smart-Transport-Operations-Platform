package com.example.Transit_Backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating a Trip.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest {

    @NotBlank(message = "Source location is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotNull(message = "Cargo weight is required")
    @DecimalMin(value = "0.01", message = "Cargo weight must be greater than zero")
    private BigDecimal cargoWeight;

    @NotNull(message = "Planned distance is required")
    @DecimalMin(value = "0.01", message = "Planned distance must be greater than zero")
    private BigDecimal plannedDistance;
}
