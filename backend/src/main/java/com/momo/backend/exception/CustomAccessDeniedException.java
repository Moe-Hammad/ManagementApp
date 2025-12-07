package com.momo.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Wird geworfen, wenn ein Benutzer keine ausreichenden Rechte hat.
 * Diese Exception wird von deinem GlobalExceptionHandler verarbeitet.
 * Diese Exception ist für die Business-Logic
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class CustomAccessDeniedException extends RuntimeException {

    public CustomAccessDeniedException(String message) {
        super(message);
    }
}
