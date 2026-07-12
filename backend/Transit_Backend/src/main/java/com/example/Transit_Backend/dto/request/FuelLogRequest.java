package com.example.Transit_Backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating or updating a Fuel Log.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLogRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long tripId;

    @NotNull(message = "Litres is required")
    @DecimalMin(value = "0.01", message = "Litres must be greater than zero")
    private BigDecimal litres;

    @NotNull(message = "Cost is required")
    @DecimalMin(value = "0.01", message = "Cost must be greater than zero")
    private BigDecimal cost;

    @DecimalMin(value = "0.0", inclusive = true, message = "Odometer reading cannot be negative")
    private BigDecimal odometerReading;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
