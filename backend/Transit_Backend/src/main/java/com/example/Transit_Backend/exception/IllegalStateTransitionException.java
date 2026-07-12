package com.example.Transit_Backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an illegal state transition is attempted.
 *
 * <p>Examples: dispatching an already-dispatched trip, completing a draft trip.</p>
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class IllegalStateTransitionException extends RuntimeException {

    public IllegalStateTransitionException(String message) {
        super(message);
    }

    public IllegalStateTransitionException(String entity, String currentState, String targetState) {
        super(String.format("Cannot transition %s from %s to %s", entity, currentState, targetState));
    }
}
