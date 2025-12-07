package com.momo.backend.Entity;

import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TaskEntityTest {

    @Test
    void testTaskStartsWithEmptyAssignments() {
        Task task = new Task();
        assertNotNull(task.getAssignments());
        assertTrue(task.getAssignments().isEmpty());
    }

    @Test
    void testTaskPropertiesAreSetCorrectly() {
        Manager manager = new Manager();
        manager.setId(UUID.randomUUID());

        Task task = new Task();
        task.setId(UUID.randomUUID());
        task.setManager(manager);
        task.setLocation("Berlin Tower");
        task.setRequiredEmployees(3);

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = start.plusHours(5);
        LocalDateTime deadline = start.minusHours(2);

        task.setStart(start);
        task.setEnd(end);
        task.setResponseDeadline(deadline);

        assertEquals(manager, task.getManager());
        assertEquals("Berlin Tower", task.getLocation());
        assertEquals(3, task.getRequiredEmployees());
        assertEquals(start, task.getStart());
        assertEquals(end, task.getEnd());
        assertEquals(deadline, task.getResponseDeadline());
    }

    @Test
    void testTaskHasId() {
        Task task = new Task();
        UUID id = UUID.randomUUID();
        task.setId(id);
        assertEquals(id, task.getId());
    }
}
