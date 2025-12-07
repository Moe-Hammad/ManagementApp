package com.momo.backend.service.interfaces;

import com.momo.backend.dto.TaskDto;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskDto createTask(TaskDto dto);
    TaskDto getTask(UUID id);
    List<TaskDto> getTasksByManager(UUID managerId);
    TaskDto updateTask(UUID id, TaskDto dto);
    void deleteTask(UUID id);
}
