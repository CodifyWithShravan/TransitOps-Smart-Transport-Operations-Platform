package com.example.Transit_Backend.dto.response;

import com.example.Transit_Backend.model.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Vehicle data sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    private Long id;
    private String registrationNumber;
    private String model;
    private String type;
    private BigDecimal maxLoadCapacity;
    private BigDecimal odometer;
    private BigDecimal acquisitionCost;
    private VehicleStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
