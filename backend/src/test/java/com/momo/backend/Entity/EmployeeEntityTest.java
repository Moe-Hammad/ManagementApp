package com.momo.backend.Entity;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import org.junit.jupiter.api.Test;

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
}
