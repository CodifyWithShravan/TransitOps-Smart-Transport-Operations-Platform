package com.example.Transit_Backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a Vehicle.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotBlank(message = "Vehicle type is required")
    private String type;

    @NotNull(message = "Max load capacity is required")
    @DecimalMin(value = "0.01", message = "Max load capacity must be greater than zero")
    private BigDecimal maxLoadCapacity;

    @NotNull(message = "Odometer reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Odometer cannot be negative")
    private BigDecimal odometer;

    @NotNull(message = "Acquisition cost is required")
    @DecimalMin(value = "0.01", message = "Acquisition cost must be greater than zero")
    private BigDecimal acquisitionCost;
}
