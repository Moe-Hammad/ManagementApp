package com.momo.backend.mapper;

import com.momo.backend.dto.ManagerDto;
import com.momo.backend.entity.Manager;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {EmployeeMapper.class})
public interface ManagerMapper {

    @Mapping(target = "employees", source = "employees")
    ManagerDto toDto(Manager manager);

    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "employees", ignore = true)
    Manager toEntity(ManagerDto dto);
}
