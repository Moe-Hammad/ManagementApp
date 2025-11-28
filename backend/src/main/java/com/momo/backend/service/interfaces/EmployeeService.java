package com.momo.backend.service.interfaces;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    EmployeeDto createEmployee(EmployeeDto employeeDto);

    UserDto registerEmployee(RegisterRequest request);

    EmployeeDto getEmployeeById(UUID employeeId);

    List<EmployeeDto> getAllEmployees();

    EmployeeDto updateEmployee(UUID employeeId, EmployeeDto updateEmployee);

    void deleteEmployee(UUID employeeId);

    ManagerDto getEmployeeManager(UUID employeeId);

    List<EmployeeDto> getUnassignedEmployees(String query);
}
