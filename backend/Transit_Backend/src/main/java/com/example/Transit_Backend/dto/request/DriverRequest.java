package com.example.Transit_Backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating or updating a Driver.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverRequest {

    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "License category is required")
    private String licenseCategory;

    @NotNull(message = "License expiry date is required")
    @Future(message = "License expiry date must be in the future")
    private LocalDate licenseExpiryDate;

    @NotBlank(message = "Contact number is required")
    private String contact;

    @DecimalMin(value = "0.0", inclusive = true, message = "Safety score cannot be negative")
    @DecimalMax(value = "100.0", message = "Safety score cannot exceed 100")
    private BigDecimal safetyScore;
}
