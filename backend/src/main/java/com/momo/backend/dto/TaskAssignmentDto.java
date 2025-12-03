package com.momo.backend.dto;

import com.momo.backend.entity.enums.AssignmentStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentDto {
    private UUID id;
    private UUID taskId;
    private UUID employeeId;
    private AssignmentStatus status;
    private LocalDateTime respondedAt;
}
