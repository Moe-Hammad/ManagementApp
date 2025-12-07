package com.momo.backend.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Schema(description = "Standard error payload returned by the API")
public class ErrorResponse {

    @Schema(description = "HTTP status code of the error", example = "401")
    private int status;

    @Schema(description = "HTTP reason phrase", example = "Unauthorized")
    private String error;

    @Schema(description = "Human readable error message", example = "Invalid credentials")
    private String message;

    @Schema(description = "Request path that caused the error", example = "/api/auth/login")
    private String path;

    @Schema(description = "UTC timestamp of the error", example = "2025-11-23T10:15:30Z")
    private String timestamp;

    public ErrorResponse() {
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(int status, String error, String message, String path, String timestamp) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }
}
