package com.example.Transit_Backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a business rule validation fails.
 *
 * <p>Examples: cargo weight exceeds vehicle capacity, driver license expired,
 * vehicle/driver not available for assignment.</p>
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
