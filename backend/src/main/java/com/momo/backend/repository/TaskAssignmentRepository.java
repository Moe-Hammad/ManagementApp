package com.momo.backend.repository;

import com.momo.backend.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {
    List<TaskAssignment> findByTaskId(UUID taskId);
    List<TaskAssignment> findByEmployeeId(UUID employeeId);
}
