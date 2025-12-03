package com.momo.backend.service.implementation;

import com.momo.backend.dto.TaskDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.TaskMapper;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * TaskServiceImple
 * ---------------------------------------------------------
 * Verwaltet Aufgaben, die von Managern erstellt werden.
 *
 * Security:
 * - Nur Manager dürfen Tasks erstellen.
 * - Manager dürfen nur ihre eigenen Tasks lesen / updaten / löschen.
 */
@Service
@RequiredArgsConstructor
public class TaskServiceImple extends AbstractSecuredService implements TaskService {

    private final TaskRepository taskRepository;
    private final ManagerRepository managerRepository;
    private final TaskMapper taskMapper;

    // ============================================================
    // CREATE
    // ============================================================
    @Override
    @Transactional
    public TaskDto createTask(TaskDto dto) {
        // 🔒 Nur Manager dürfen Tasks erstellen
        UUID managerId = requireManagerAndGetId();
        validate(dto);

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Task task = taskMapper.toEntity(dto);
        task.setManager(manager);

        Task saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    // ============================================================
    // GET SINGLE
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public TaskDto getTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // 🔒 Nur der verantwortliche Manager darf die Details sehen
        UUID currentManager = requireManagerAndGetId();
        if (!task.getManager().getId().equals(currentManager)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks sehen.");
        }

        return taskMapper.toDto(task);
    }

    // ============================================================
    // GET BY MANAGER
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByManager(UUID managerId) {
        // 🔒 Sicherstellen, dass Manager eingeloggt ist
        UUID currentManager = requireManagerAndGetId();

        if (!currentManager.equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks sehen.");
        }

        return taskRepository.findByManagerId(managerId).stream()
                .map(taskMapper::toDto)
                .toList();
    }

    // ============================================================
    // UPDATE
    // ============================================================
    @Override
    @Transactional
    public TaskDto updateTask(UUID id, TaskDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        UUID currentManager = requireManagerAndGetId();
        if (!task.getManager().getId().equals(currentManager)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks bearbeiten.");
        }

        validate(dto);

        // DTO in bestehendes Entity mappen
        taskMapper.updateFromDto(dto, task);
        // sicherstellen, dass Manager nicht überschrieben wird
        task.setManager(task.getManager());

        Task saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    // ============================================================
    // DELETE
    // ============================================================
    @Override
    @Transactional
    public void deleteTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        UUID currentManager = requireManagerAndGetId();
        if (!task.getManager().getId().equals(currentManager)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Tasks löschen.");
        }

        taskRepository.delete(task);
    }

    // ============================================================
    // VALIDATION
    // ============================================================
    private void validate(TaskDto dto) {
        if (!StringUtils.hasText(dto.getCompany())) {
            throw new IllegalArgumentException("Company must not be empty");
        }
        if (!StringUtils.hasText(dto.getLocation())) {
            throw new IllegalArgumentException("Location must not be empty");
        }
    }
}
