package com.example.Transit_Backend.model.enums;

/**
 * Represents the operational status of a Vehicle in the fleet.
 */
public enum VehicleStatus {

    /** Vehicle is idle and can be assigned to a trip. */
    AVAILABLE,

    /** Vehicle is currently assigned to an active trip. */
    ON_TRIP,

    /** Vehicle is undergoing maintenance or repair. */
    IN_SHOP,

    /** Vehicle has been permanently decommissioned. */
    RETIRED
}
