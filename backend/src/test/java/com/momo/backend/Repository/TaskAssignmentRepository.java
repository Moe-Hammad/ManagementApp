package com.momo.backend.Repository;

import com.momo.backend.entity.*;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.TaskAssignmentRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class TaskAssignmentRepositoryTest {

    @Autowired
    private TaskAssignmentRepository assignmentRepo;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    // Hilfsmethode: erzeugt validen Task
    private Task createTask(Manager m) {
        Task t = new Task();
        t.setManager(m);
        t.setLocation("Berlin");
        t.setRequiredEmployees(2);
        t.setStart(LocalDateTime.now().plusDays(1));
        t.setEnd(LocalDateTime.now().plusDays(1).plusHours(4));
        t.setResponseDeadline(LocalDateTime.now().plusHours(12));
        return taskRepository.save(t);
    }

    @Test
    void testSaveTaskAssignment() {
        // Manager
        Manager m = new Manager();
        m.setFirstName("Boss");
        m.setLastName("Man");
        m.setEmail("boss@mail.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        // Task
        Task task = createTask(m);

        // Employee
        Employee e = new Employee();
        e.setFirstName("Tim");
        e.setLastName("Worker");
        e.setEmail("tim@mail.com");
        e.setPassword("1234");
        e.setRole(UserRole.EMPLOYEE);
        userRepository.save(e);

        // Assignment
        TaskAssignment ta = new TaskAssignment();
        ta.setTask(task);
        ta.setEmployee(e);
        ta.setStatus(AssignmentStatus.PENDING);

        assignmentRepo.save(ta);

        TaskAssignment saved = assignmentRepo.findById(ta.getId()).orElse(null);

        assertNotNull(saved);
        assertEquals(e.getId(), saved.getEmployee().getId());
        assertEquals(task.getId(), saved.getTask().getId());
        assertEquals(AssignmentStatus.PENDING, saved.getStatus());
    }

    @Test
    void testFindByTaskId() {
        Manager m = new Manager();
        m.setFirstName("Boss");
        m.setLastName("Test");
        m.setEmail("boss@test.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = createTask(m);

        Employee e = new Employee();
        e.setFirstName("A");
        e.setLastName("B");
        e.setEmail("a@b.com");
        e.setPassword("123");
        e.setRole(UserRole.EMPLOYEE);
        userRepository.save(e);

        TaskAssignment ta = new TaskAssignment();
        ta.setTask(task);
        ta.setEmployee(e);
        ta.setStatus(AssignmentStatus.PENDING);
        assignmentRepo.save(ta);

        var list = assignmentRepo.findByTaskId(task.getId());

        assertEquals(1, list.size());
        assertEquals(e.getId(), list.getFirst().getEmployee().getId());
    }

    @Test
    void testFindByEmployeeId() {
        Manager m = new Manager();
        m.setFirstName("Boss2");
        m.setLastName("Test");
        m.setEmail("boss2@test.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = createTask(m);

        Employee e = new Employee();
        e.setFirstName("C");
        e.setLastName("D");
        e.setEmail("c@d.com");
        e.setPassword("123");
        e.setRole(UserRole.EMPLOYEE);
        userRepository.save(e);

        TaskAssignment ta = new TaskAssignment();
        ta.setTask(task);
        ta.setEmployee(e);
        ta.setStatus(AssignmentStatus.ACCEPTED);
        assignmentRepo.save(ta);

        var list = assignmentRepo.findByEmployeeId(e.getId());

        assertEquals(1, list.size());
        assertEquals(task.getId(), list.getFirst().getTask().getId());
    }

    @Test
    void testCannotSaveAssignmentWithoutTask() {
        Employee e = new Employee();
        e.setFirstName("Z");
        e.setLastName("Y");
        e.setEmail("zy@mail.com");
        e.setPassword("123");
        e.setRole(UserRole.EMPLOYEE);
        userRepository.save(e);

        TaskAssignment ta = new TaskAssignment();
        ta.setEmployee(e);
        ta.setStatus(AssignmentStatus.PENDING);

        assertThrows(Exception.class, () -> {
            assignmentRepo.save(ta);
            assignmentRepo.flush();
        });
    }

    @Test
    void testCannotSaveAssignmentWithoutEmployee() {
        Manager m = new Manager();
        m.setFirstName("MM");
        m.setLastName("KK");
        m.setEmail("mm@mail.com");
        m.setPassword("1234");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Task task = createTask(m);

        TaskAssignment ta = new TaskAssignment();
        ta.setTask(task);
        ta.setStatus(AssignmentStatus.PENDING);

        assertThrows(Exception.class, () -> {
            assignmentRepo.save(ta);
            assignmentRepo.flush();
        });
    }
}
