package com.momo.backend.mapper;

import com.momo.backend.dto.TaskDto;
import com.momo.backend.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "managerId", source = "manager.id")
    TaskDto toDto(Task task);

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    Task toEntity(TaskDto dto);

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    void updateFromDto(TaskDto dto, @MappingTarget Task task);
}
