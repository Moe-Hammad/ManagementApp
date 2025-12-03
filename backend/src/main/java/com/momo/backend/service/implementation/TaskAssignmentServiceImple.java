package com.momo.backend.service.implementation;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.TaskAssignment;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.TaskAssignmentMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.TaskAssignmentRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.TaskAssignmentService;
import com.momo.backend.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;






@Service
@RequiredArgsConstructor
public class TaskAssignmentServiceImple extends AbstractSecuredService implements TaskAssignmentService {

    private final TaskAssignmentRepository assignmentRepository;
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final ChatService chatService;
    private final TaskAssignmentMapper taskAssignmentMapper;

    // ============================================================
    // CREATE ASSIGNMENT — ONLY MANAGER
    // ============================================================
    @Override
    @Transactional
    public TaskAssignmentDto createAssignment(TaskAssignmentDto dto) {

        UUID managerId = requireManagerAndGetId();

        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // 🔒 Manager darf NUR seine eigenen Tasks zuweisen
        if (!task.getManager().getId().equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks zuweisen.");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TaskAssignment assignment = taskAssignmentMapper.toEntity(dto);
        assignment.setTask(task);
        assignment.setEmployee(employee);
        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : AssignmentStatus.PENDING);

        return taskAssignmentMapper.toDto(assignmentRepository.save(assignment));
    }


    // ============================================================
    // GET SINGLE ASSIGNMENT — MANAGER OR EMPLOYEE
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public TaskAssignmentDto getAssignment(UUID id) {
        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        UUID current = getCurrentUserId();
        UUID taskManager = assignment.getTask().getManager().getId();
        UUID employeeId = assignment.getEmployee().getId();

        if (!current.equals(taskManager) && !current.equals(employeeId)) {
            throw new CustomAccessDeniedException("Kein Zugriff auf diese Assignment.");
        }

        return taskAssignmentMapper.toDto(assignment);
    }


    // ============================================================
    // GET ASSIGNMENTS FOR TASK — ONLY MANAGER
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<TaskAssignmentDto> getAssignmentsForTask(UUID taskId) {

        UUID managerId = requireManagerAndGetId();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getManager().getId().equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks einsehen.");
        }

        return assignmentRepository.findByTaskId(taskId).stream()
                .map(taskAssignmentMapper::toDto)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ASSIGNMENTS FOR EMPLOYEE — ONLY OWN ASSIGNMENTS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<TaskAssignmentDto> getAssignmentsForEmployee(UUID employeeId) {

        UUID current = getCurrentUserId();

        if (!current.equals(employeeId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Assignments sehen.");
        }

        return assignmentRepository.findByEmployeeId(employeeId).stream()
                .map(taskAssignmentMapper::toDto)
                .collect(Collectors.toList());
    }


    // ============================================================
    // UPDATE STATUS — ONLY EMPLOYEE
    // ============================================================
    @Override
    @Transactional
    public TaskAssignmentDto updateStatus(UUID id, AssignmentStatus status) {

        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        UUID current = getCurrentUserId();
        UUID employeeId = assignment.getEmployee().getId();

        // 🔒 Nur der Mitarbeiter selbst darf den Status ändern
        if (!current.equals(employeeId)) {
            throw new CustomAccessDeniedException("Nur der Employee darf seinen Assignment-Status ändern.");
        }

        assignment.setStatus(status);
        assignment.setRespondedAt(LocalDateTime.now());

        TaskAssignment saved = assignmentRepository.save(assignment);

        if (status == AssignmentStatus.ACCEPTED) {
            chatService.addMemberToTaskChat(saved.getTask().getId(), saved.getEmployee().getId());
        }

        return taskAssignmentMapper.toDto(saved);
    }


    // ============================================================
    // DELETE ASSIGNMENT — ONLY MANAGER
    // ============================================================
    @Override
    @Transactional
    public void deleteAssignment(UUID id) {

        UUID managerId = requireManagerAndGetId();

        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTask().getManager().getId().equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Assignments löschen.");
        }

        assignmentRepository.delete(assignment);
    }
}
