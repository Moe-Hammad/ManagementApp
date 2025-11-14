package com.momo.backend.service;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;

import java.util.List;
import java.util.UUID;

public interface ManagerService {
    ManagerDto createManager (ManagerDto managerDto);
    ManagerDto getManagerById(UUID managerId);
    List<EmployeeDto> getAllEmployeesUnderManager();
    ManagerDto updateManager(UUID managerId, ManagerDto updateManager);
    void deleteEmployee (UUID managerId);
}
