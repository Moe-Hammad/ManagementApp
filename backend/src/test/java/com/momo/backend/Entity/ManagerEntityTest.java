package com.momo.backend.Entity;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Transactional // sorgt dafür, dass alle Änderungen nach jedem Test automatisch zurückgerollt werden
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ManagerEntityLifecycleTest {

    private Manager momo;
    private Employee arbeiter;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @BeforeEach
    void setupBeforeEach() {
        // vorherige Daten löschen, um Unique-Constraint zu vermeiden
        employeeRepository.deleteAll();
        managerRepository.deleteAll();

        momo = new Manager();
        momo.setFirstName("Momo");
        momo.setLastName("Dev");
        momo.setEmail("momo@test.com");
        momo.setPassword("abc123");

        momo = managerRepository.save(momo);

        arbeiter = new Employee();
        arbeiter.setLastName("Peter");
        arbeiter.setFirstName("Hans");
        arbeiter.setEmail("HansPeter_" + System.currentTimeMillis() + "@email.de"); // unique
        arbeiter.setPassword("meinNeuesPassword");

        arbeiter = employeeRepository.save(arbeiter);

        assertThat(momo.getId()).isNotNull();
        assertThat(arbeiter.getId()).isNotNull();
        System.out.println("📦 Manager & Employee vor Test gespeichert!");
    }

    @AfterEach
    void tearDownAfterEach() {
        employeeRepository.deleteAll();
        managerRepository.deleteAll();
    }

    @Test
    void shouldAssignManagerRoleOnPersist() {
        Manager m = new Manager();
        m.setFirstName("Max");
        m.setLastName("Muster");
        m.setEmail("max" + System.currentTimeMillis() + "@test.com");
        m.setPassword("abc123");

        Manager saved = managerRepository.save(m);

        assertThat(saved.getRole()).isEqualTo("manager");
    }

    @Test
    void shouldGenerateIdWhenSaving() {
        Manager m = new Manager();
        m.setFirstName("Lisa");
        m.setLastName("Meier");
        m.setEmail("lisa" + System.currentTimeMillis() + "@test.com");
        m.setPassword("test");

        Manager saved = managerRepository.save(m);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isNotEqualTo(momo.getId());
    }

    @Test
    void shouldAddEmployeeToManagerAndPersistRelationshipAndDelete() {
        momo.addEmployee(arbeiter);

        // speichern, um Relation in DB zu schreiben
        managerRepository.save(momo);

        // reload aus DB
        Manager saved = managerRepository.findById(momo.getId()).orElseThrow();
        assertThat(saved.getEmployees()).hasSize(1);
        assertThat(saved.getEmployees().get(0).getManager()).isEqualTo(momo);

        momo.removeEmployee(arbeiter);

        // speichern, um Relation in DB zu schreiben
        Manager del = managerRepository.save(momo);


        assertThat(del.getEmployees()).isNotNull();

    }
}
