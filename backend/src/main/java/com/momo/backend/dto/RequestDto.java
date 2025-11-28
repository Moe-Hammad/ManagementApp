package com.momo.backend.dto;

import com.momo.backend.entity.enums.RequestStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class RequestDto {
    private UUID id;
    private UUID managerId;
    private UUID employeeId;
    private RequestStatus status;
    private String message;
    private Instant createdAt;
    private Instant updatedAt;
}
