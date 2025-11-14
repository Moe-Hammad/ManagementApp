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

        Employee employee = employeeMapper.toEntity(employeeDto);
        Employee savedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee with id " + employeeId + " not found.")
                );

        return employeeMapper.toDto(employee);
    }
    @Override
    public List<EmployeeDto> getAllEmployees() {
        List <Employee> employees = employeeRepository.findAll();

        return employees.stream().
                map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(UUID employeeId, EmployeeDto updateEmployee) {
        Employee em = employeeRepository.findById(employeeId).orElseThrow(() ->
                new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
        em.setFirstName(updateEmployee.getFirstName());
        em.setLastName(updateEmployee.getLastName());
        em.setEmail(updateEmployee.getEmail());
        em.setHourlyRate(updateEmployee.getHourlyRate());
        Employee update = employeeRepository.save(em);
        return employeeMapper.toDto(update);
    }

    @Override
    public void deleteEmployee(UUID employeeId) {
        Employee em = employeeRepository.findById(employeeId).orElseThrow(() ->
                new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
        employeeRepository.deleteById(employeeId);
        
    }

    @Override
    public ManagerDto getEmployeeManager(UUID employeeId) {
        Employee em = employeeRepository.findById(employeeId).orElseThrow(() ->
                new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
       Manager manager = em.getManager();

       return managerMapper.toDto(manager);
    }

}
