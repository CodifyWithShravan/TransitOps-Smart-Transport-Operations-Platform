package com.example.Transit_Backend.model.enums;

/**
 * Represents user roles in TransitOps for Role-Based Access Control (RBAC).
 */
public enum Role {
    /** Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency. */
    FLEET_MANAGER,

    /** Creates trips, assigns vehicles and drivers, and monitors active deliveries. */
    DISPATCHER,

    /** Ensures driver compliance, tracks license validity, and monitors safety scores. */
    SAFETY_OFFICER,

    /** Reviews operational expenses, fuel consumption, maintenance costs, and profitability. */
    FINANCIAL_ANALYST,

    /** System administrator with full access across all modules. */
    ADMIN
}
