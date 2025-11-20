package com.momo.backend.dto;

import com.momo.backend.entity.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private UUID id;
    private UUID employeeId;
    private UUID decidedById;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private LeaveStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;
}
