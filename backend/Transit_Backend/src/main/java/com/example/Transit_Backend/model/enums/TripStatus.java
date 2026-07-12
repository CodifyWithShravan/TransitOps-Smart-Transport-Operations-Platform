package com.example.Transit_Backend.model.enums;

/**
 * Represents the lifecycle status of a Trip.
 */
public enum TripStatus {

    /** Trip has been created but not yet dispatched. */
    DRAFT,

    /** Trip has been dispatched; vehicle and driver are en route. */
    DISPATCHED,

    /** Trip has been successfully completed. */
    COMPLETED,

    /** Trip has been cancelled before or during execution. */
    CANCELLED
}
