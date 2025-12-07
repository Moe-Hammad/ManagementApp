package com.momo.backend.service.implementation;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.TaskAssignment;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.TaskAssignmentMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.TaskAssignmentRepository;
import com.momo.backend.repository.CalendarEntryRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.TaskAssignmentService;
import com.momo.backend.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final CalendarEntryRepository calendarEntryRepository;
    private final ChatService chatService;
    private final TaskAssignmentMapper taskAssignmentMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // ============================================================
    // CREATE ASSIGNMENT - ONLY MANAGER
    // ============================================================
    @Override
    @Transactional
    public TaskAssignmentDto createAssignment(TaskAssignmentDto dto) {

        UUID managerId = requireManagerAndGetId();

        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Manager darf NUR seine eigenen Tasks zuweisen
        if (!task.getManager().getId().equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks zuweisen.");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TaskAssignment assignment = taskAssignmentMapper.toEntity(dto);
        assignment.setTask(task);
        assignment.setEmployee(employee);
        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : AssignmentStatus.PENDING);

        TaskAssignment saved = assignmentRepository.save(assignment);

        if (saved.getStatus() == AssignmentStatus.ACCEPTED) {
            upsertTaskCalendarEntry(saved);
            if (isGroupTask(saved.getTask())) {
                ensureTaskChatMembership(saved);
            }
        }
        publishAssignmentEvent(saved);

        return taskAssignmentMapper.toDto(saved);
    }


    // ============================================================
    // GET SINGLE ASSIGNMENT - MANAGER OR EMPLOYEE
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
    // GET ASSIGNMENTS FOR TASK - ONLY MANAGER
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
    // GET ASSIGNMENTS FOR EMPLOYEE - ONLY OWN ASSIGNMENTS
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
    // UPDATE STATUS - ONLY EMPLOYEE
    // ============================================================
    @Override
    @Transactional
    public TaskAssignmentDto updateStatus(UUID id, AssignmentStatus status) {

        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        UUID current = getCurrentUserId();
        UUID employeeId = assignment.getEmployee().getId();

        // Nur der Mitarbeiter selbst darf den Status aendern
        if (!current.equals(employeeId)) {
            throw new CustomAccessDeniedException("Nur der Employee darf seinen Assignment-Status aendern.");
        }

        assignment.setStatus(status);
        assignment.setRespondedAt(LocalDateTime.now());

        TaskAssignment saved = assignmentRepository.save(assignment);

        if (status == AssignmentStatus.ACCEPTED) {
            if (isGroupTask(saved.getTask())) {
                ensureTaskChatMembership(saved);
            }
            upsertTaskCalendarEntry(saved);
        } else {
            removeTaskCalendarEntry(saved);
        }
        publishAssignmentEvent(saved);

        return taskAssignmentMapper.toDto(saved);
    }


    // ============================================================
    // DELETE ASSIGNMENT - ONLY MANAGER
    // ============================================================
    @Override
    @Transactional
    public void deleteAssignment(UUID id) {

        UUID managerId = requireManagerAndGetId();

        TaskAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTask().getManager().getId().equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Assignments loeschen.");
        }

        removeTaskCalendarEntry(assignment);
        assignmentRepository.delete(assignment);
        publishAssignmentEvent(assignment);
    }

    private void upsertTaskCalendarEntry(TaskAssignment assignment) {
        Task task = assignment.getTask();
        UUID taskId = task.getId();
        UUID employeeId = assignment.getEmployee().getId();

        CalendarEntry entry = calendarEntryRepository.findByTaskIdAndEmployeeId(taskId, employeeId)
                .orElseGet(CalendarEntry::new);

        entry.setTask(task);
        entry.setEmployee(assignment.getEmployee());
        entry.setType(CalendarEntryType.TASK);
        entry.setStart(task.getStart());
        entry.setEnd(task.getEnd());

        calendarEntryRepository.save(entry);
    }

    private void removeTaskCalendarEntry(TaskAssignment assignment) {
        UUID taskId = assignment.getTask().getId();
        UUID employeeId = assignment.getEmployee().getId();
        calendarEntryRepository.findByTaskIdAndEmployeeId(taskId, employeeId)
                .ifPresent(calendarEntryRepository::delete);
    }

    private void publishAssignmentEvent(TaskAssignment assignment) {
        var dto = taskAssignmentMapper.toDto(assignment);
        messagingTemplate.convertAndSendToUser(dto.getEmployeeId().toString(), "/queue/assignments", dto);
        messagingTemplate.convertAndSendToUser(assignment.getTask().getManager().getId().toString(), "/queue/assignments", dto);
    }

    private boolean isGroupTask(Task task) {
        return task.getRequiredEmployees() > 1;
    }

    /**
     * Ensure task chat exists and add employee as member. If chat is missing, create it and retry.
     */
    private void ensureTaskChatMembership(TaskAssignment assignment) {
        Task task = assignment.getTask();
        UUID taskId = task.getId();
        UUID employeeId = assignment.getEmployee().getId();
        try {
            chatService.addMemberToTaskChat(taskId, employeeId);
        } catch (ResourceNotFoundException ex) {
            chatService.createTaskGroup(task, task.getManager());
            chatService.addMemberToTaskChat(taskId, employeeId);
        }
    }
}
