package com.momo.backend.Repository;

import com.momo.backend.entity.*;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.entity.enums.LeaveStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
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
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        // Employees erstellen
        Employee e1 = new Employee();
        e1.setFirstName("Max");
        e1.setLastName("Worker");
        e1.setEmail("max@test.com");
        e1.setPassword("abc");
        e1.setRole(UserRole.EMPLOYEE);
        e1.setManager(m);

        Employee e2 = new Employee();
        e2.setFirstName("Lisa");
        e2.setLastName("Worker");
        e2.setEmail("lisa@test.com");
        e2.setPassword("xyz");
        e2.setRole(UserRole.EMPLOYEE);
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
        m.setRole(UserRole.MANAGER);
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
        a.setRole(UserRole.MANAGER);
        userRepository.save(a);

        // Manager B
        Manager b = new Manager();
        b.setFirstName("B");
        b.setLastName("Boss");
        b.setEmail("b@test.com");
        b.setPassword("123");
        b.setRole(UserRole.MANAGER);
        userRepository.save(b);

        // Employee gehört nur A
        Employee e = new Employee();
        e.setFirstName("Peter");
        e.setLastName("Other");
        e.setEmail("peter@test.com");
        e.setPassword("pass");
        e.setRole(UserRole.EMPLOYEE);
        e.setManager(a);
        userRepository.save(e);

        // query: Employees von B
        List<Employee> found = employeeRepository.findByManagerId(b.getId());

        assertNotNull(found);
        assertTrue(found.isEmpty());
    }


    // =====================================================
    // NEUE TESTS: CalendarEntries & LeaveRequests
    // =====================================================

    private Employee createEmployeeWithManager() {
        Manager m = new Manager();
        m.setFirstName("Boss");
        m.setLastName("Man");
        m.setEmail("boss@mail.com");
        m.setPassword("123");
        m.setRole(UserRole.MANAGER);
        userRepository.save(m);

        Employee e = new Employee();
        e.setFirstName("Tom");
        e.setLastName("Worker");
        e.setEmail("tom@mail.com");
        e.setPassword("123");
        e.setRole(UserRole.EMPLOYEE);
        e.setManager(m);

        userRepository.save(e);
        return e;
    }

    // -----------------------------------------------
    // CalendarEntries by Manager
    // -----------------------------------------------
    @Test
    void testFindCalendarEntriesByManagerId() {
        Employee emp = createEmployeeWithManager();

        CalendarEntry entry = new CalendarEntry();
        entry.setEmployee(emp);
        entry.setType(CalendarEntryType.SICK);
        entry.setStart(LocalDateTime.now());
        entry.setEnd(LocalDateTime.now().plusHours(4));

        emp.getCalendarEntries().add(entry);
        userRepository.save(emp);

        List<CalendarEntry> results =
                employeeRepository.findCalendarEntriesByManagerId(emp.getManager().getId());

        assertEquals(1, results.size());
        assertEquals(CalendarEntryType.SICK, results.getFirst().getType());
    }

    @Test
    void testFindCalendarEntriesByManagerId_NoEntries() {
        Employee emp = createEmployeeWithManager();

        List<CalendarEntry> results =
                employeeRepository.findCalendarEntriesByManagerId(emp.getManager().getId());

        assertTrue(results.isEmpty());
    }

    // -----------------------------------------------
    // LeaveRequests by Manager
    // -----------------------------------------------
    @Test
    void testFindLeaveRequestsByManagerId() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req = new LeaveRequest();
        req.setEmployee(emp);
        req.setReason("Urlaub");
        req.setStartDate(LocalDateTime.now().plusDays(1));
        req.setEndDate(LocalDateTime.now().plusDays(3));
        req.setStatus(LeaveStatus.PENDING);

        emp.getLeaveRequests().add(req);
        userRepository.save(emp);

        List<LeaveRequest> results =
                employeeRepository.findLeaveRequestsByManagerId(emp.getManager().getId());

        assertEquals(1, results.size());
        assertEquals("Urlaub", results.getFirst().getReason());
    }

    @Test
    void testFindLeaveRequestsByManagerId_NoRequests() {
        Employee emp = createEmployeeWithManager();

        List<LeaveRequest> results =
                employeeRepository.findLeaveRequestsByManagerId(emp.getManager().getId());

        assertTrue(results.isEmpty());
    }

    // -----------------------------------------------
    // Manager does NOT exist
    // -----------------------------------------------
    @Test
    void testFindCalendarEntriesByManagerId_ManagerDoesNotExist() {
        List<CalendarEntry> results =
                employeeRepository.findCalendarEntriesByManagerId(UUID.randomUUID());

        assertTrue(results.isEmpty());
    }

    @Test
    void testFindLeaveRequestsByManagerId_ManagerDoesNotExist() {
        List<LeaveRequest> results =
                employeeRepository.findLeaveRequestsByManagerId(UUID.randomUUID());

        assertTrue(results.isEmpty());
    }
}
