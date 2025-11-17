package com.momo.backend.service.implementation;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.mapper.ManagerMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.ManagerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ManagerServiceImple implements ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerMapper managerMapper;
    private final EmployeeMapper employeeMapper;

    // ============================================
    // CREATE
    // ============================================

    @Override
    public ManagerDto createManager(ManagerDto dto) {
        Manager manager = managerMapper.toEntity(dto);
        managerRepository.save(manager);
        return managerMapper.toDto(manager);
    }

    // ============================================
    // READ
    // ============================================

    @Override
    public ManagerDto getManagerById(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager " + managerId + " not found"));
        return managerMapper.toDto(manager);
    }

    @Override
    public List<EmployeeDto> getAllEmployeesUnderManager(UUID managerId) {
        UUID validatedId = Objects.requireNonNull(managerId, "Manager id must not be null");

        // Echte Entity holen (DTO wäre falsch!)
        Manager manager = managerRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        List<Employee> employees = employeeRepository.findByManagerId(manager.getId());

        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    // ============================================
    // UPDATE
    // ============================================

    @Override
    @Transactional
    public ManagerDto updateManager(UUID managerId, ManagerDto updateManager) {
        UUID validatedId = Objects.requireNonNull(managerId, "Manager id must not be null");
        Objects.requireNonNull(updateManager, "Update payload must not be null");

        // Echte Manager-Entity holen
        Manager manager = managerRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager with id " + validatedId + " not found."));

        // Nur Änderungen setzen – NICHT komplett neu mappen
        manager.setFirstName(updateManager.getFirstName());
        manager.setLastName(updateManager.getLastName());
        manager.setEmail(updateManager.getEmail());

        managerRepository.save(manager);

        return managerMapper.toDto(manager);
    }

    // ============================================
    // DELETE
    // ============================================

    @Override
    public void deleteManager(UUID managerId) {
        UUID validatedId = Objects.requireNonNull(managerId, "Manager id must not be null");

        Manager manager = managerRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager with id " + validatedId + " not found."));

        managerRepository.delete(manager);
    }

    // ============================================
    // RELATION MANAGEMENT
    // ============================================

    @Override
    @Transactional
    public void addEmployee(UUID managerId, UUID employeeId) {
        UUID validatedManagerId = Objects.requireNonNull(managerId, "Manager id must not be null");
        UUID validatedEmployeeId = Objects.requireNonNull(employeeId, "Employee id must not be null");

        // ECHTE Entities aus der DB holen (kein DTO!)
        Manager manager = managerRepository.findById(validatedManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(validatedEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Beziehung setzen
        manager.addEmployee(employee); // setzt beide Seiten
        employeeRepository.save(employee); // owner
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID managerId, UUID employeeId) {
        UUID validatedManagerId = Objects.requireNonNull(managerId, "Manager id must not be null");
        UUID validatedEmployeeId = Objects.requireNonNull(employeeId, "Employee id must not be null");

        Manager manager = managerRepository.findById(validatedManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(validatedEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        manager.removeEmployee(employee);
        employeeRepository.save(employee); // owner
    }
}
