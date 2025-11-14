package com.momo.backend.service;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;

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


