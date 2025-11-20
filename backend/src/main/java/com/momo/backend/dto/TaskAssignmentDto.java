package com.momo.backend.dto;

import com.momo.backend.entity.enums.AssignmentStatus;
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
public class TaskAssignmentDto {
    private UUID id;
    private UUID taskId;
    private UUID employeeId;
    private AssignmentStatus status;
    private LocalDateTime respondedAt;
}
