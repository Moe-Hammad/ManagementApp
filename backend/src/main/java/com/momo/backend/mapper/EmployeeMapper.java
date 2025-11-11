package com.momo.backend.mapper;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    Employee toEntity(EmployeeDto dto);

    EmployeeDto toDto(Employee employee);
}
