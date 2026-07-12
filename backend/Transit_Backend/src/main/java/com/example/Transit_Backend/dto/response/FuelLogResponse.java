package com.example.Transit_Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for FuelLog data sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLogResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long tripId;
    private BigDecimal litres;
    private BigDecimal cost;
    private BigDecimal odometerReading;
    private LocalDate date;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
