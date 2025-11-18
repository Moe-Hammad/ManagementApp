package com.momo.backend.service;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.ManagerDto;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {
    EmployeeDto createEmployee (EmployeeDto employeeDto);
    EmployeeDto getEmployeeById(UUID employeeId);
    List<EmployeeDto> getAllEmployees();
    EmployeeDto updateEmployee(UUID employeeId, EmployeeDto updateEmployee);
    void deleteEmployee (UUID employeeId);
    ManagerDto getEmployeeManager(UUID employeeId);
}


