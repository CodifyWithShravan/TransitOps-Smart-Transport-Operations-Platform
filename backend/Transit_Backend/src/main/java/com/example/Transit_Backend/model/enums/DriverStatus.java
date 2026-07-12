package com.example.Transit_Backend.model.enums;

/**
 * Represents the operational status of a Driver.
 */
public enum DriverStatus {

    /** Driver is idle and can be assigned to a trip. */
    AVAILABLE,

    /** Driver is currently assigned to an active trip. */
    ON_TRIP,

    /** Driver is off duty (e.g., leave, rest day). */
    OFF_DUTY,

    /** Driver has been suspended and cannot be assigned to any trip. */
    SUSPENDED
}
