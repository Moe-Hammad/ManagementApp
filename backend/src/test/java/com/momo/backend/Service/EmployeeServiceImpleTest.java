package com.momo.backend.Service;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapperImpl;
import com.momo.backend.mapper.ManagerMapperImpl;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.implementation.EmployeeServiceImple;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;


import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({EmployeeServiceImple.class, EmployeeMapperImpl.class, ManagerMapperImpl.class})
class EmployeeServiceImpleTest {

    @Autowired
    private EmployeeServiceImple employeeService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ManagerRepository managerRepository;

    private Manager testManager;

    @BeforeEach
    void setupBeforeEach() {
        employeeRepository.deleteAll();
        managerRepository.deleteAll();

        testManager = new Manager();
        testManager.setFirstName("Chief");
        testManager.setLastName("Boss");
        testManager.setEmail("chief" + System.currentTimeMillis() + "@mail.com");
        testManager.setPassword("pass123");

        testManager = managerRepository.save(testManager);
        assertThat(testManager.getId()).isNotNull();
    }

    @AfterEach
    void tearDown() {
        employeeRepository.deleteAll();
        managerRepository.deleteAll();
    }

    @Test
    void shouldCreateEmployeeCorrectly() {
        EmployeeDto dto = new EmployeeDto(
                null, "Lisa", "Tester", "lisa@example.com",
                "secret", "employee", 25.0, true, null
        );

        EmployeeDto saved = employeeService.createEmployee(dto);

        assertThat(saved.getId()).isNotNull();
        assertThat(employeeRepository.findById(saved.getId())).isPresent();
    }

    @Test
    void shouldReturnEmployeeById() {
        EmployeeDto created = employeeService.createEmployee(
                sampleEmployeeDto("hans@example.com")
        );

        EmployeeDto found = employeeService.getEmployeeById(created.getId());

        assertThat(found.getEmail()).isEqualTo("hans@example.com");
    }

    @Test
    void getEmployeeById_shouldThrowWhenNotFound() {
        UUID id = UUID.randomUUID();

        assertThatThrownBy(() -> employeeService.getEmployeeById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldUpdateEmployeeCorrectly() {
        EmployeeDto created = employeeService.createEmployee(
                sampleEmployeeDto("anna@example.com")
        );

        EmployeeDto update = new EmployeeDto(
                null, "Anna", "Updated", "newmail@example.com",
                null, "employee", 30.0, false, null
        );

        EmployeeDto changed = employeeService.updateEmployee(created.getId(), update);

        assertThat(changed.getLastName()).isEqualTo("Updated");
        assertThat(changed.getEmail()).isEqualTo("newmail@example.com");

        Employee savedEntity = employeeRepository.findById(created.getId()).orElseThrow();
        assertThat(savedEntity.getEmail()).isEqualTo("newmail@example.com");
    }

    @Test
    void shouldDeleteEmployee() {
        EmployeeDto created = employeeService.createEmployee(
                sampleEmployeeDto("delete@example.com")
        );

        employeeService.deleteEmployee(created.getId());

        assertThat(employeeRepository.findById(created.getId())).isEmpty();
    }

    @Test
    void shouldReturnEmployeeManager() {
        // employee mit manager anlegen
        Employee e = new Employee();
        e.setFirstName("Managed");
        e.setLastName("Worker");
        e.setEmail("worker@example.com");
        e.setPassword("pw");
        e.setHourlyRate(22.0);
        e.setAvailability(true);
        e.setManager(testManager);

        e = employeeRepository.save(e);

        ManagerDto managerDto = employeeService.getEmployeeManager(e.getId());

        assertThat(managerDto.getId()).isEqualTo(testManager.getId());
    }

    @Test
    void shouldThrowWhenEmployeeHasNoManager() {
        EmployeeDto created = employeeService.createEmployee(
                sampleEmployeeDto("nomgr@example.com")
        );

        assertThatThrownBy(() -> employeeService.getEmployeeManager(created.getId()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no manager assigned");
    }

    // helper
    private EmployeeDto sampleEmployeeDto(String email) {
        return new EmployeeDto(
                null, "Hans", "Meier", email,
                "secret", "employee", 25.0, true, null
        );
    }
}
