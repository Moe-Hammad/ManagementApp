package com.momo.backend.service.interfaces;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.enums.AssignmentStatus;

import java.util.List;
import java.util.UUID;

public interface TaskAssignmentService {
    TaskAssignmentDto createAssignment(TaskAssignmentDto dto);
    TaskAssignmentDto getAssignment(UUID id);
    List<TaskAssignmentDto> getAssignmentsForTask(UUID taskId);
    List<TaskAssignmentDto> getAssignmentsForEmployee(UUID employeeId);
    TaskAssignmentDto updateStatus(UUID id, AssignmentStatus status);
    void deleteAssignment(UUID id);
}
