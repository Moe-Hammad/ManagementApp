package com.momo.backend.Repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class EmployeeRepositoryTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    // -----------------------------------------------
    // POSITIVER FALL: Manager hat Employees
    // -----------------------------------------------
    @Test
    void testFindEmployeesByManagerId_Positive() {

        // Manager erstellen
        Manager m = new Manager();
        m.setFirstName("Alice");
        m.setLastName("Boss");
        m.setEmail("boss@test.com");
        m.setPassword("123");
        userRepository.save(m);

        // Employees erstellen
        Employee e1 = new Employee();
        e1.setFirstName("Max");
        e1.setLastName("Worker");
        e1.setEmail("max@test.com");
        e1.setPassword("abc");
        e1.setManager(m);

        Employee e2 = new Employee();
        e2.setFirstName("Lisa");
        e2.setLastName("Worker");
        e2.setEmail("lisa@test.com");
        e2.setPassword("xyz");
        e2.setManager(m);

        userRepository.save(e1);
        userRepository.save(e2);

        // Repository-Abfrage
        List<Employee> found = employeeRepository.findByManagerId(m.getId());

        assertEquals(2, found.size());
        assertTrue(found.stream().anyMatch(e -> e.getEmail().equals("max@test.com")));
        assertTrue(found.stream().anyMatch(e -> e.getEmail().equals("lisa@test.com")));
    }

    // -----------------------------------------------
    // NEGATIVER FALL 1: Manager ohne Employees
    // -----------------------------------------------
    @Test
    void testFindEmployeesByManagerId_NoEmployees() {
        Manager m = new Manager();
        m.setFirstName("Empty");
        m.setLastName("Boss");
        m.setEmail("empty@test.com");
        m.setPassword("123");
        userRepository.save(m);

        List<Employee> found = employeeRepository.findByManagerId(m.getId());

        assertNotNull(found);
        assertTrue(found.isEmpty());
    }

    // -----------------------------------------------
    // NEGATIVER FALL 2: Manager existiert nicht
    // -----------------------------------------------
    @Test
    void testFindEmployeesByManagerId_ManagerDoesNotExist() {
        UUID randomId = UUID.randomUUID();

        List<Employee> found = employeeRepository.findByManagerId(randomId);

        assertNotNull(found);
        assertTrue(found.isEmpty());
    }

    // -----------------------------------------------
    // NEGATIVER FALL 3: Employee gehört anderem Manager
    // -----------------------------------------------
    @Test
    void testFindEmployeesByManagerId_OtherManager() {
        // Manager A
        Manager a = new Manager();
        a.setFirstName("A");
        a.setLastName("Boss");
        a.setEmail("a@test.com");
        a.setPassword("123");
        userRepository.save(a);

        // Manager B
        Manager b = new Manager();
        b.setFirstName("B");
        b.setLastName("Boss");
        b.setEmail("b@test.com");
        b.setPassword("123");
        userRepository.save(b);

        // Employee gehört nur A
        Employee e = new Employee();
        e.setFirstName("Peter");
        e.setLastName("Other");
        e.setEmail("peter@test.com");
        e.setPassword("pass");
        e.setManager(a);
        userRepository.save(e);

        // query: Employees von B
        List<Employee> found = employeeRepository.findByManagerId(b.getId());

        assertNotNull(found);
        assertTrue(found.isEmpty());
    }
}
