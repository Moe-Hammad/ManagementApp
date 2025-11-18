package com.momo.backend.Entity;

import com.momo.backend.entity.*;

import com.momo.backend.entity.enums.AssignmentStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TaskAssignmentEntityTest {

    @Test
    void testDefaultStatusIsPending() {
        TaskAssignment ta = new TaskAssignment();
        assertEquals(AssignmentStatus.PENDING, ta.getStatus());
    }

    @Test
    void testSetEmployeeAndTask() {
        Task task = new Task();
        Employee emp = new Employee();
        TaskAssignment ta = new TaskAssignment();

        ta.setTask(task);
        ta.setEmployee(emp);

        assertEquals(task, ta.getTask());
        assertEquals(emp, ta.getEmployee());
    }

    @Test
    void testRespondedAtInitiallyNull() {
        TaskAssignment ta = new TaskAssignment();
        assertNull(ta.getRespondedAt());
    }

    @Test
    void testSetRespondedAt() {
        TaskAssignment ta = new TaskAssignment();
        LocalDateTime now = LocalDateTime.now();
        ta.setRespondedAt(now);

        assertEquals(now, ta.getRespondedAt());
    }
}
