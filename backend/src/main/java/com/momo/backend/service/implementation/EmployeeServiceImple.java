package com.momo.backend.service.implementation;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.mapper.ManagerMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmployeeServiceImple implements EmployeeService {

    private EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final ManagerMapper managerMapper;

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Objects.requireNonNull(employeeDto, "Employee payload must not be null");

        Employee employee = Objects.requireNonNull(
                employeeMapper.toEntity(employeeDto),
                "Mapper returned null Employee instance");
        Employee savedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(UUID employeeId) {
        UUID validatedId = Objects.requireNonNull(employeeId, "Employee id must not be null");
        Employee employee = employeeRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with id " + validatedId + " not found."));

        return employeeMapper.toDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();

        return employees.stream().map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(UUID employeeId, EmployeeDto updateEmployee) {
        UUID validatedId = Objects.requireNonNull(employeeId, "Employee id must not be null");
        Objects.requireNonNull(updateEmployee, "Update payload must not be null");

        Employee em = employeeRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with id " + validatedId + " not found."));
        em.setFirstName(updateEmployee.getFirstName());
        em.setLastName(updateEmployee.getLastName());
        em.setEmail(updateEmployee.getEmail());
        em.setHourlyRate(updateEmployee.getHourlyRate());
        em.setAvailability(updateEmployee.getAvailability());
        Employee update = employeeRepository.save(em);
        return employeeMapper.toDto(update);
    }

    @Override
    public void deleteEmployee(UUID employeeId) {
        UUID validatedId = Objects.requireNonNull(employeeId, "Employee id must not be null");
        Employee em = employeeRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with id " + validatedId + " not found."));
        employeeRepository.delete(em);

    }

    @Override
    public ManagerDto getEmployeeManager(UUID employeeId) {
        UUID validatedId = Objects.requireNonNull(employeeId, "Employee id must not be null");
        Employee em = employeeRepository.findById(validatedId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with id " + validatedId + " not found."));
        Manager manager = em.getManager();
        if (manager == null) {
            throw new ResourceNotFoundException("Employee with id " + validatedId + " has no manager assigned.");
        }

        return managerMapper.toDto(manager);
    }

}
