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
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.interfaces.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImple implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ManagerRepository managerRepository;
    private final EmployeeMapper employeeMapper;
    private final ManagerMapper managerMapper;


    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {

        // 1) Employee Entity bauen
        Employee employee = employeeMapper.toEntity(employeeDto);

        // 2) Manager zuordnen (Pflicht!)
        if (employeeDto.getManagerId() != null) {
            Manager manager = managerRepository.findById(employeeDto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

            employee.setManager(manager);
        }

        // 3) Speichern
        Employee saved = employeeRepository.save(employee);

        // 4) Zurück zu DTO mappen
        return employeeMapper.toDto(saved);
    }


    // REGISTER
    @Override
    public UserDto registerEmployee(RegisterRequest request) {

        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPassword(request.getPassword());
        employee.setHourlyRate(request.getHourlyRate());
        employee.setRole(UserRole.EMPLOYEE);

        Employee saved = employeeRepository.save(employee);

        return new UserDto(saved.getId(), saved.getEmail(), saved.getRole());
    }

    // READ
    @Override
    public EmployeeDto getEmployeeById(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return employeeMapper.toDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ManagerDto getEmployeeManager(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Manager manager = employee.getManager();
        return managerMapper.toDto(manager);
    }

    // UPDATE
    @Override
    public EmployeeDto updateEmployee(UUID employeeId, EmployeeDto updateEmployee) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        employee.setFirstName(updateEmployee.getFirstName());
        employee.setLastName(updateEmployee.getLastName());
        employee.setEmail(updateEmployee.getEmail());
        employee.setHourlyRate(updateEmployee.getHourlyRate());
        employee.setAvailability(updateEmployee.getAvailability());

        return employeeMapper.toDto(employeeRepository.save(employee));
    }

    // DELETE
    @Override
    public void deleteEmployee(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        employeeRepository.delete(employee);
    }
}
