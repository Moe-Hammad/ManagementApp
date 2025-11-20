package com.momo.backend.Repository;

import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    private Task validTask(Manager m) {
        Task t = new Task();
        t.setManager(m);
        t.setLocation("Berlin");
        t.setRequiredEmployees(3);
        t.setStart(LocalDateTime.now().plusDays(1));
        t.setEnd(LocalDateTime.now().plusDays(1).plusHours(5));
        t.setResponseDeadline(LocalDateTime.now().plusHours(12));
        return t;
    }

    @Test
    void testSaveTask() {
        Manager manager = new Manager();
        manager.setFirstName("Boss");
        manager.setLastName("Man");
        manager.setEmail("boss@mail.com");
        manager.setPassword("1234");
        manager.setRole(UserRole.MANAGER);
        userRepository.save(manager);

        Task task = validTask(manager);
        taskRepository.save(task);

        Task saved = taskRepository.findById(task.getId()).orElse(null);

        assertNotNull(saved);
        assertEquals("Berlin", saved.getLocation());
        assertEquals(3, saved.getRequiredEmployees());
        assertEquals(manager.getId(), saved.getManager().getId());
        assertTrue(saved.getAssignments().isEmpty());
    }

    @Test
    void testFindByManagerId() {
        Manager manager = new Manager();
        manager.setFirstName("Karl");
        manager.setLastName("Chef");
        manager.setEmail("karl@mail.com");
        manager.setPassword("1234");
        manager.setRole(UserRole.MANAGER);
        userRepository.save(manager);

        Task task = validTask(manager);
        task.setLocation("Hamburg");

        taskRepository.save(task);

        var results = taskRepository.findByManagerId(manager.getId());

        assertEquals(1, results.size());
        assertEquals("Hamburg", results.getFirst().getLocation());
    }

    @Test
    void testCannotSaveTaskWithoutManager() {
        Task task = new Task();
        task.setLocation("Berlin");
        task.setRequiredEmployees(3);
        task.setStart(LocalDateTime.now().plusDays(1));
        task.setEnd(LocalDateTime.now().plusDays(1).plusHours(2));

        assertThrows(Exception.class, () -> {
            taskRepository.save(task);
            taskRepository.flush();
        });
    }

    @Test
    void testCannotSaveTaskWithoutLocation() {
        Manager m = new Manager();
        m.setFirstName("A");
        m.setLastName("B");
        m.setEmail("boss@mail.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = validTask(m);
        task.setLocation(null);

        assertThrows(Exception.class, () -> {
            taskRepository.save(task);
            taskRepository.flush();
        });
    }

    @Test
    void testCannotSaveTaskWithoutStart() {
        Manager m = new Manager();
        m.setFirstName("A");
        m.setLastName("B");
        m.setEmail("boss@mail.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = validTask(m);
        task.setStart(null);

        assertThrows(Exception.class, () -> {
            taskRepository.save(task);
            taskRepository.flush();
        });
    }

    @Test
    void testCannotSaveTaskWithoutEnd() {
        Manager m = new Manager();
        m.setFirstName("A");
        m.setLastName("B");
        m.setEmail("boss@mail.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = validTask(m);
        task.setEnd(null);

        assertThrows(Exception.class, () -> {
            taskRepository.save(task);
            taskRepository.flush();
        });
    }
}
