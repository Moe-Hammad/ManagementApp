package com.momo.backend.service.implementation;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.TaskAssignment;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.TaskAssignmentMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.TaskAssignmentRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.interfaces.TaskAssignmentService;
import com.momo.backend.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskAssignmentServiceImple implements TaskAssignmentService {

    private final TaskAssignmentRepository assignmentRepository;
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final ChatService chatService;
    private final TaskAssignmentMapper taskAssignmentMapper;

    @Override
    public TaskAssignmentDto createAssignment(TaskAssignmentDto dto) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TaskAssignment assignment = taskAssignmentMapper.toEntity(dto);
        assignment.setTask(task);
        assignment.setEmployee(employee);
        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : AssignmentStatus.PENDING);

        return taskAssignmentMapper.toDto(assignmentRepository.save(assignment));
    }

    @Override
    public TaskAssignmentDto getAssignment(UUID id) {
        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        return taskAssignmentMapper.toDto(assignment);
    }

    @Override
    public List<TaskAssignmentDto> getAssignmentsForTask(UUID taskId) {
        return assignmentRepository.findByTaskId(taskId).stream()
                .map(taskAssignmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskAssignmentDto> getAssignmentsForEmployee(UUID employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId).stream()
                .map(taskAssignmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskAssignmentDto updateStatus(UUID id, AssignmentStatus status) {
        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        assignment.setStatus(status);
        assignment.setRespondedAt(LocalDateTime.now());

        TaskAssignment saved = assignmentRepository.save(assignment);
        if (status == AssignmentStatus.APPROVED) {
            chatService.addMemberToTaskChat(saved.getTask().getId(), saved.getEmployee().getId());
        }
        return taskAssignmentMapper.toDto(saved);
    }

    @Override
    public void deleteAssignment(UUID id) {
        TaskAssignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        assignmentRepository.delete(existing);
    }
}
