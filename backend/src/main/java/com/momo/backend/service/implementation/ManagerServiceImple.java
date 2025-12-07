package com.momo.backend.service.implementation;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.mapper.ManagerMapper;
import com.momo.backend.mapper.UserMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.interfaces.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerServiceImple implements ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerMapper managerMapper;
    private final EmployeeMapper employeeMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // ----------------------
    // REGISTER
    // ----------------------
    @Override
    public UserDto registerManager(RegisterRequest request) {
        Manager manager = new Manager();
        manager.setFirstName(request.getFirstName());
        manager.setLastName(request.getLastName());
        manager.setEmail(request.getEmail());
        manager.setPassword(request.getPassword());
        manager.setRole(UserRole.MANAGER);

        Manager saved = managerRepository.save(manager);
        return userMapper.managerToUserDto(saved);
    }

    @Override
    public ManagerDto createManager(ManagerDto managerDto) {
        Manager manager = managerMapper.toEntity(managerDto);
        Manager saved = managerRepository.save(manager);
        return managerMapper.toDto(saved);
    }

    // ----------------------
    // READ
    // ----------------------
    @Override
    public ManagerDto getManagerById(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        return managerMapper.toDto(manager);
    }

    @Override
    public ManagerDto getManagerByEmail(String email) {
        Manager manager = managerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        return managerMapper.toDto(manager);
    }

    @Override
    public List<EmployeeDto> getAllEmployeesUnderManager(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        List<Employee> employees = employeeRepository.findByManagerId(managerId);

        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    // ----------------------
    // UPDATE
    // ----------------------
    @Override
    @Transactional
    public ManagerDto updateManager(UUID managerId, ManagerDto updateManager) {

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        manager.setFirstName(updateManager.getFirstName());
        manager.setLastName(updateManager.getLastName());
        manager.setEmail(updateManager.getEmail());

        return managerMapper.toDto(managerRepository.save(manager));
    }

    // ----------------------
    // DELETE
    // ----------------------
    @Override
    public void deleteManager(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        managerRepository.delete(manager);
    }

    // ----------------------
    // RELATIONS
    // ----------------------
    @Override
    @Transactional
    public void addEmployee(UUID managerId, UUID employeeId) {

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        manager.addEmployee(employee);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID managerId, UUID employeeId) {

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        manager.removeEmployee(employee);
        employeeRepository.save(employee);
    }


}
