package com.momo.backend.service.implementation;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class EmployeeServiceImple implements EmployeeService {

    private EmployeeRepository employeeRepository;

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {

        Employee employee = EmployeeMapper.mapToEmployee(employeeDto);
        Employee savedEmployee = employeeRepository.save(employee);
        return EmployeeMapper.mapToEmployee(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(Long employeeId) {
    Employee employee = employeeRepository.findById(employeeId).
            orElseThrow( () ->
                    new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
    return EmployeeMapper.mapToEmployee(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List <Employee> employees = employeeRepository.findAll();

        return employees.stream().
                map((employee) -> EmployeeMapper.mapToEmployee(employee)).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(Long employeeId, EmployeeDto updateEmployee) {
        Employee em = employeeRepository.findById(employeeId).orElseThrow(() ->
                new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
        em.setFirstName(updateEmployee.getFirstName());
        em.setLastName(updateEmployee.getLastName());
        em.setEmail(updateEmployee.getEmail());
        Employee update = employeeRepository.save(em);
        return EmployeeMapper.mapToEmployee(update);
    }

    @Override
    public void deleteEmployee(Long employeeId) {
        Employee em = employeeRepository.findById(employeeId).orElseThrow(() ->
                new  ResourceNotFoundException("Employee with id " + employeeId + " not found."));
        employeeRepository.deleteById(employeeId);
    }

}
