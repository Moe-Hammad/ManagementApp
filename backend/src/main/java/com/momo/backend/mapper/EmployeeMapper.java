package com.momo.backend.mapper;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "managerId", source = "manager.id")
    EmployeeDto toDto(Employee employee);

    @Mapping(target = "manager", ignore = true)
    Employee toEntity(EmployeeDto dto);
}
