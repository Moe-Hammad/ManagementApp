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
import com.momo.backend.service.implementation.ManagerServiceImple;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({ManagerServiceImple.class, ManagerMapperImpl.class, EmployeeMapperImpl.class})
class ManagerServiceImpleTest {

    @Autowired
    private ManagerServiceImple managerService;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Manager momo;

    private Employee sampleEmployee(String email, Manager mgr) {
        Employee e = new Employee();
        e.setFirstName("Emp");
        e.setLastName("Loyee");
        e.setEmail(email);
        e.setPassword("pw");
        e.setAvailability(true);
        e.setHourlyRate(20.0);
        e.setManager(mgr);

        return e;
    }
    @BeforeEach
    void setupBeforeEach() {
        employeeRepository.deleteAll();
        managerRepository.deleteAll();

        momo = new Manager();
        momo.setFirstName("Momo");
        momo.setLastName("Dev");
        momo.setEmail("momo_" + System.currentTimeMillis() + "@test.com");
        momo.setPassword("secret");

        momo = managerRepository.save(momo);

        assertThat(momo.getId()).isNotNull();
    }

    @AfterEach
    void afterEach() {
        employeeRepository.deleteAll();
        managerRepository.deleteAll();
    }

    @Test
    void shouldCreateManagerCorrectly() {
        ManagerDto dto = new ManagerDto(
                null, "Lisa", "Boss", "lisa@test.com",
                "pass", "manager", null
        );

        ManagerDto created = managerService.createManager(dto);

        assertThat(created.getId()).isNotNull();
    }

    @Test
    void shouldReturnManagerById() {
        ManagerDto found = managerService.getManagerById(momo.getId());

        assertThat(found.getEmail()).isEqualTo(momo.getEmail());
    }

    @Test
    void shouldThrowWhenManagerNotFound() {
        UUID random = UUID.randomUUID();

        assertThatThrownBy(() -> managerService.getManagerById(random))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldUpdateManagerCorrectly() {
        ManagerDto update = new ManagerDto(
                null, "Updated", "Manager", "updated@mail.com",
                null, "manager", null
        );

        ManagerDto changed = managerService.updateManager(momo.getId(), update);

        assertThat(changed.getEmail()).isEqualTo("updated@mail.com");
    }

    @Test
    void shouldDeleteManager() {
        managerService.deleteManager(momo.getId());

        assertThat(managerRepository.findById(momo.getId())).isEmpty();
    }

    @Test
    void shouldReturnAllEmployeesUnderManager() {
        Employee e1 = employeeRepository.save(sampleEmployee("a@mail.com", momo));
        Employee e2 = employeeRepository.save(sampleEmployee("b@mail.com", momo));

        List<EmployeeDto> list = managerService.getAllEmployeesUnderManager(momo.getId());

        assertThat(list).hasSize(2);
    }

    @Test
    void shouldAddEmployeeToManager() {
        Employee e = employeeRepository.save(sampleEmployee("add@mail.com", null));

        managerService.addEmployee(momo.getId(), e.getId());

        Employee reloaded = employeeRepository.findById(e.getId()).orElseThrow();

        assertThat(reloaded.getManager().getId()).isEqualTo(momo.getId());
    }

    @Test
    void shouldRemoveEmployeeFromManager() {
        Employee e = employeeRepository.save(sampleEmployee("remove@mail.com", momo));

        managerService.deleteEmployee(momo.getId(), e.getId());

        Employee reloaded = employeeRepository.findById(e.getId()).orElseThrow();

        assertThat(reloaded.getManager()).isNull();
    }


}
