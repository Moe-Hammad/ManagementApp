package com.momo.backend.mapper;

import com.momo.backend.dto.RequestDto;
import com.momo.backend.entity.Request;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RequestMapper {

    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "employeeId", source = "employee.id")
    RequestDto toDto(Request request);

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "employee", ignore = true)
    Request toEntity(RequestDto dto);
}
