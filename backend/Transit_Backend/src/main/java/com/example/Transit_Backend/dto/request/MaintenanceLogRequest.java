package com.example.Transit_Backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating or updating a Maintenance Log.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLogRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    private String description;

    @NotNull(message = "Cost is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Cost cannot be negative")
    private BigDecimal cost;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
}
