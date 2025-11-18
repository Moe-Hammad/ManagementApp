package com.momo.backend.Repository;

import com.momo.backend.entity.*;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ManagerRepositoryTest {

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveManager() {
        Manager m = new Manager();
        m.setFirstName("Tom");
        m.setLastName("Hansen");
        m.setEmail("tom@office.com");
        m.setPassword("1234"); // wird gehashed
        // Über das UserRepository speichern (wegen Vererbung)
        userRepository.save(m);

        Manager saved = managerRepository.findById(m.getId()).orElse(null);

        assertNotNull(saved);
        assertEquals("Tom", saved.getFirstName());
        assertEquals("Hansen", saved.getLastName());
        assertEquals("tom@office.com", saved.getEmail());
        assertNotEquals("1234", saved.getPassword()); // password wurde gehashed
    }

    @Test
    void testManagerWithEmployeesIsSavedCorrectly() {
        // Manager erstellen
        Manager manager = new Manager();
        manager.setFirstName("Anna");
        manager.setLastName("Schmidt");
        manager.setEmail("anna@manager.com");
        manager.setPassword("secret");

        // Employees anlegen
        Employee e1 = new Employee();
        e1.setFirstName("Max");
        e1.setLastName("Müller");
        e1.setEmail("max@emp.com");
        e1.setPassword("123");

        Employee e2 = new Employee();
        e2.setFirstName("Sarah");
        e2.setLastName("Becker");
        e2.setEmail("sarah@emp.com");
        e2.setPassword("123");

        // Relationship setzen
        manager.addEmployee(e1);
        manager.addEmployee(e2);

        // Manager + Employees speichern (über userRepo, wegen Vererbung)
        userRepository.save(manager);
        userRepository.save(e1);
        userRepository.save(e2);

        // Laden
        Manager loaded = managerRepository.findById(manager.getId()).orElse(null);

        assertNotNull(loaded);
        assertEquals(2, loaded.getEmployees().size());
        assertTrue(
                loaded.getEmployees().stream().anyMatch(emp -> emp.getEmail().equals("max@emp.com"))
        );
        assertTrue(
                loaded.getEmployees().stream().anyMatch(emp -> emp.getEmail().equals("sarah@emp.com"))
        );

        // Check: Employees haben den Manager gesetzt
        assertEquals(manager.getId(), loaded.getEmployees().get(0).getManager().getId());
    }
    @Test
    void testRemoveEmployeeUpdatesBothSides() {
        Manager manager = new Manager();

        manager.setFirstName("Hans");
        manager.setLastName("Krüger");
        manager.setEmail("hans@manager.com");
        manager.setPassword("1234");

        Employee emp = new Employee();

        emp.setFirstName("Paul");
        emp.setLastName("Winter");
        emp.setEmail("paul@emp.com");
        emp.setPassword("123");

        manager.addEmployee(emp);

        userRepository.save(manager);
        userRepository.save(emp);

        // Entfernen
        manager.removeEmployee(emp);
        userRepository.save(manager);
        userRepository.save(emp);

        Manager loaded = managerRepository.findById(manager.getId()).orElseThrow();

        assertTrue(loaded.getEmployees().isEmpty());
        assertNull(emp.getManager()); // Beziehung wurde korrekt getrennt
    }



}
