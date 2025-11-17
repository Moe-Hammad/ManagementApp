package com.momo.backend.Entity;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmployeeEntityTest {

    @Test
    void testEmployeeManagerAssignment() {
        Manager m = new Manager();
        Employee e = new Employee();

        e.setManager(m);

        assertEquals(m, e.getManager());
    }

    @Test
    void testEmployeeDefaultRole() {
        Employee e = new Employee();
        assertEquals("employee", e.getRole());
    }

    @Test
    void testEmployeeFields() {
        Employee e = new Employee();

        e.setHourlyRate(15.5);
        e.setAvailability(true);

        assertEquals(15.5, e.getHourlyRate());
        assertTrue(e.getAvailability());
    }
}
