package com.momo.backend.mapper;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.TaskAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TaskAssignmentMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "employeeId", source = "employee.id")
    TaskAssignmentDto toDto(TaskAssignment assignment);

    @Mapping(target = "task", ignore = true)
    @Mapping(target = "employee", ignore = true)
    TaskAssignment toEntity(TaskAssignmentDto dto);

    @Mapping(target = "task", ignore = true)
    @Mapping(target = "employee", ignore = true)
    void updateFromDto(TaskAssignmentDto dto, @MappingTarget TaskAssignment assignment);
}
