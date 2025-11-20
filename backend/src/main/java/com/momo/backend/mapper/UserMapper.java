package com.momo.backend.mapper;

import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", constant = "MANAGER")
    UserDto managerToUserDto(Manager manager);

    @Mapping(target = "role", constant = "EMPLOYEE")
    UserDto employeeToUserDto(Employee employee);
}
