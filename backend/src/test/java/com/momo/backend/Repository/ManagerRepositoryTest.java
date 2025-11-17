package com.momo.backend.Repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
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
    void testSaveManagerPersistsUserFields() {
        Manager m = new Manager();
        m.setFirstName("Mara");
        m.setLastName("Bosslady");
        m.setEmail("mara@boss.com");
        m.setPassword("pass123");

        Manager saved = managerRepository.save(m);

        assertNotNull(saved.getId());
        assertEquals("Mara", saved.getFirstName());
        assertTrue(saved.getPassword().startsWith("$2")); // hashing check
    }

    @Test
    void testManagerWithEmployeesPersistsCorrectly() {
        Manager manager = new Manager();
        manager.setFirstName("John");
        manager.setLastName("Doe");
        manager.setEmail("john@doe.com");
        manager.setPassword("1234");

        manager = managerRepository.save(manager);

        Employee e1 = new Employee();
        e1.setFirstName("Worker");
        e1.setLastName("One");
        e1.setEmail("worker1@test.com");
        e1.setPassword("abcd");
        e1.setManager(manager);

        Employee e2 = new Employee();
        e2.setFirstName("Worker");
        e2.setLastName("Two");
        e2.setEmail("worker2@test.com");
        e2.setPassword("abcd");
        e2.setManager(manager);

        // employees müssen über userRepository gespeichert werden wegen inheritance
        userRepository.save(e1);
        userRepository.save(e2);

        Manager loaded = managerRepository.findById(manager.getId()).orElse(null);

        assertNotNull(loaded);
        assertEquals(2, loaded.getEmployees().size());
    }
}
