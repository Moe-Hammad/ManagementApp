package com.momo.backend.dto;

import com.momo.backend.entity.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto {
    private UUID id;
    private UUID managerId;
    private UUID employeeId;
    private RequestStatus status;
    private String message;
    private Instant createdAt;
    private Instant updatedAt;
}
