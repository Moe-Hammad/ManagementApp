package com.momo.backend.Entity;

import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.TaskAssignment;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EmployeeEntityTest {

    @Test
    void testAvailabilityCanBeSet() {
        Employee e = new Employee();
        e.setAvailability(false);
        assertFalse(e.isAvailability());

        e.setAvailability(true);
        assertTrue(e.isAvailability());
    }

    @Test
    void testHourlyRateCanBeSet() {
        Employee e = new Employee();
        e.setHourlyRate(20.0);

        assertEquals(20.0, e.getHourlyRate());
    }

    @Test
    void testEmployeeCanHaveManager() {
        Manager m = new Manager();
        Employee e = new Employee();

        e.setManager(m);
        assertEquals(m, e.getManager());
    }

    @Test
    void testEmployeeManagerCanBeUnset() {
        Manager m = new Manager();
        Employee e = new Employee();

        e.setManager(m);
        e.setManager(null);

        assertNull(e.getManager());
    }

    // -------------------------------------------------------
    // NEW TESTS FOR UPDATED EMPLOYEE ENTITY
    // -------------------------------------------------------

    @Test
    void testEmployeeStartsWithEmptyAssignments() {
        Employee e = new Employee();
        assertNotNull(e.getAssignments());
        assertTrue(e.getAssignments().isEmpty());
    }

    @Test
    void testEmployeeStartsWithEmptyCalendarEntries() {
        Employee e = new Employee();
        assertNotNull(e.getCalendarEntries());
        assertTrue(e.getCalendarEntries().isEmpty());
    }

    @Test
    void testAddCalendarEntryToEmployee() {
        Employee e = new Employee();
        CalendarEntry entry = new CalendarEntry();

        // add
        e.getCalendarEntries().add(entry);
        entry.setEmployee(e);

        assertEquals(1, e.getCalendarEntries().size());
        assertEquals(e, entry.getEmployee());
    }

    @Test
    void testRemoveCalendarEntryFromEmployee() {
        Employee e = new Employee();
        CalendarEntry entry = new CalendarEntry();

        e.getCalendarEntries().add(entry);
        entry.setEmployee(e);

        // remove
        e.getCalendarEntries().remove(entry);
        entry.setEmployee(null);

        assertTrue(e.getCalendarEntries().isEmpty());
        assertNull(entry.getEmployee());
    }

    @Test
    void testAddAssignmentToEmployee() {
        Employee e = new Employee();
        TaskAssignment assignment = new TaskAssignment();

        e.getAssignments().add(assignment);
        assignment.setEmployee(e);

        assertEquals(1, e.getAssignments().size());
        assertEquals(e, assignment.getEmployee());
    }

    @Test
    void testRemoveAssignmentFromEmployee() {
        Employee e = new Employee();
        TaskAssignment assignment = new TaskAssignment();

        e.getAssignments().add(assignment);
        assignment.setEmployee(e);

        e.getAssignments().remove(assignment);
        assignment.setEmployee(null);

        assertTrue(e.getAssignments().isEmpty());
        assertNull(assignment.getEmployee());
    }
}
