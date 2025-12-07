package com.momo.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Wird ausgelöst, wenn im Code explizit eine ResourceNotFoundException geworfen wird.
     * Beispiel: User wurde nicht gefunden.
     * → Antwortet automatisch mit HTTP 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",                  // kurzer Fehlertext
                ex.getMessage(),              // Detailnachricht aus der Exception
                request.getRequestURI(),      // welcher Endpoint den Fehler verursacht hat
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Wird ausgelöst, wenn Validation via @Valid fehlschlägt.
     * Beispiel: Pflichtfeld fehlt, Format ungültig etc.
     * → Antwortet mit HTTP 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        // Holt die Fehlermeldung der ersten invaliden Property
        String msg = Objects.requireNonNull(ex.getBindingResult().getFieldError()).getDefaultMessage();

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                msg,
                request.getRequestURI(),
                null
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * HANDLING FÜR ResponseStatusException (z. B. 409 bei "Email already in use")
     *
     * Diese Exceptions werden mit einem HTTP-Statuscode erzeugt.
     * Ohne diesen Handler würden sie vom generic Handler (unten) abgefangen
     * und zu einem 500 Internal Server Error umgewandelt werden.
     *
     * → Deshalb geben wir hier den originalen Status korrekt zurück.
     */
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            org.springframework.web.server.ResponseStatusException ex,
            HttpServletRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
                ex.getStatusCode().value(),   // z. B. 409
                ex.getReason(),               // kurze Beschreibung
                ex.getMessage(),              // detaillierte Nachricht
                request.getRequestURI(),
                null
        );

        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    /**
     * Der Fallback-Handler – fängt JEDE Exception ab, die oben nicht
     * abgefangen wurde.
     *
     * → Bedeutet: Das hier sind wirklich "unerwartete" Fehler.
     * → Beantwortet immer mit HTTP 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request
    ) {
        // Loggt den kompletten Stacktrace im Backend
        log.error("Unhandled exception processing request {}", request.getRequestURI(), ex);

        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getRequestURI(),
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
