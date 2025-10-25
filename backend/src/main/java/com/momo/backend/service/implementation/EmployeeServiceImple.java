package com.momo.backend.service.implementation;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


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

}
