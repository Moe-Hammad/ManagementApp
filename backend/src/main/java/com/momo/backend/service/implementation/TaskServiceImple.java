package com.momo.backend.service.implementation;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.momo.backend.dto.TaskDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.TaskMapper;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.interfaces.TaskService;
import com.momo.backend.service.interfaces.ChatService;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImple implements TaskService {

    private final TaskRepository taskRepository;
    private final ManagerRepository managerRepository;
    private final TaskMapper taskMapper;
    private final ChatService chatService;

    @Override
    public TaskDto createTask(TaskDto dto) {
        Manager manager = managerRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        validate(dto);
        Task task = taskMapper.toEntity(dto);
        task.setManager(manager);

        Task saved = taskRepository.save(task);
        chatService.createTaskGroup(saved, manager);
        return taskMapper.toDto(saved);
    }

    @Override
    public TaskDto getTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return taskMapper.toDto(task);
    }

    @Override
    public List<TaskDto> getTasksByManager(UUID managerId) {
        return taskRepository.findByManagerId(managerId).stream()
                .map(taskMapper::toDto)
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

        validate(dto);
        taskMapper.updateFromDto(dto, existing);
        existing.setManager(manager);
        return taskMapper.toDto(taskRepository.save(existing));
    }

    @Override
    public void deleteTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    private void validate(TaskDto dto) {
        if (!StringUtils.hasText(dto.getCompany())) {
            throw new IllegalArgumentException("Company must not be empty");
        }
        if (!StringUtils.hasText(dto.getLocation())) {
            throw new IllegalArgumentException("Location must not be empty");
        }
    }
}
