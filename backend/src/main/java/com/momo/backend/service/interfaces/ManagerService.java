package com.momo.backend.service.interfaces;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface ManagerService {

    UserDto registerManager(RegisterRequest request);

    ManagerDto getManagerById(UUID managerId);

    ManagerDto getManagerByEmail(String email);

    List<EmployeeDto> getAllEmployeesUnderManager(UUID managerId);

    ManagerDto updateManager(UUID managerId, ManagerDto updateManager);

    void deleteManager(UUID managerId);

    void addEmployee(UUID managerId, UUID employeeId);

    void deleteEmployee(UUID managerId, UUID employeeId);

    ManagerDto createManager(ManagerDto managerDto);
}
