package com.example.Transit_Backend.dto.response;

import com.example.Transit_Backend.model.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for MaintenanceLog data sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLogResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String maintenanceType;
    private String description;
    private BigDecimal cost;
    private LocalDate startDate;
    private LocalDate endDate;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
