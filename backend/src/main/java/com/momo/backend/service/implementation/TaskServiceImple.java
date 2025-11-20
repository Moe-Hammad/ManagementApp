package com.momo.backend.service.implementation;

import com.momo.backend.dto.TaskDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.interfaces.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImple implements TaskService {

    private final TaskRepository taskRepository;
    private final ManagerRepository managerRepository;

    @Override
    public TaskDto createTask(TaskDto dto) {
        Manager manager = managerRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Task task = new Task();
        applyFields(task, dto, manager);

        return toDto(taskRepository.save(task));
    }

    @Override
    public TaskDto getTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return toDto(task);
    }

    @Override
    public List<TaskDto> getTasksByManager(UUID managerId) {
        return taskRepository.findByManagerId(managerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto updateTask(UUID id, TaskDto dto) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Manager manager = existing.getManager();
        if (dto.getManagerId() != null && !dto.getManagerId().equals(existing.getManager().getId())) {
            manager = managerRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        }

        applyFields(existing, dto, manager);
        return toDto(taskRepository.save(existing));
    }

    @Override
    public void deleteTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    private TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getManager() != null ? task.getManager().getId() : null,
                task.getLocation(),
                task.getRequiredEmployees(),
                task.getStart(),
                task.getEnd(),
                task.getResponseDeadline()
        );
    }

    private void applyFields(Task task, TaskDto dto, Manager manager) {
        task.setManager(manager);
        task.setLocation(dto.getLocation());
        task.setRequiredEmployees(dto.getRequiredEmployees());
        task.setStart(dto.getStart());
        task.setEnd(dto.getEnd());
        task.setResponseDeadline(dto.getResponseDeadline());
    }
}
