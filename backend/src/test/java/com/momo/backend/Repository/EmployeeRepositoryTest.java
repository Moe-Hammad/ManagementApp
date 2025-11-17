package com.momo.backend.Repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class EmployeeRepositoryTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveEmployeeWorks() {
        Manager manager = new Manager();
        manager.setEmail("boss@test.com");
        manager.setFirstName("Boss");
        manager.setLastName("Man");
        manager.setPassword("1234");
        manager = managerRepository.save(manager);

        Employee e = new Employee();
        e.setEmail("worker@test.com");
        e.setFirstName("Worker");
        e.setLastName("Bee");
        e.setPassword("abcd");
        e.setManager(manager);

        userRepository.save(e);

        Employee loaded = employeeRepository.findById(e.getId()).orElse(null);

        assertNotNull(loaded);
        assertEquals("Worker", loaded.getFirstName());
        assertEquals(manager.getId(), loaded.getManager().getId());
    }

    @Test
    void testFindByManagerIdReturnsCorrectEmployees() {
        Manager manager = new Manager();
        manager.setEmail("boss@test.com");
        manager.setFirstName("Boss");
        manager.setLastName("Man");
        manager.setPassword("1234");
        manager = managerRepository.save(manager);

        Employee e1 = new Employee();
        e1.setEmail("w1@test.com");
        e1.setFirstName("One");
        e1.setLastName("Worker");
        e1.setPassword("abcd");
        e1.setManager(manager);

        Employee e2 = new Employee();
        e2.setEmail("w2@test.com");
        e2.setFirstName("Two");
        e2.setLastName("Worker");
        e2.setPassword("abcd");
        e2.setManager(manager);

        userRepository.save(e1);
        userRepository.save(e2);

        List<Employee> workers = employeeRepository.findByManagerId(manager.getId());

        assertEquals(2, workers.size());
    }
}
