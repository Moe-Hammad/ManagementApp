package com.momo.backend.Entity;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class ManagerEntityTest {

    @Test
    void testEmployeesListStartsEmpty() {
        Manager m = new Manager();
        assertNotNull(m.getEmployees());
        assertTrue(m.getEmployees().isEmpty());
    }
    @Test
    void testManagerDefaultRole() {
        Manager m = new Manager();
        assertEquals("manager", m.getRole());
    }


    @Test
    void testAddEmployeeSetsBothSides() {
        Manager m = new Manager();
        Employee e = new Employee();

        m.addEmployee(e);

        assertEquals(1, m.getEmployees().size());
        assertEquals(m, e.getManager());
    }

    @Test
    void testRemoveEmployeeClearsBothSides() {
        Manager m = new Manager();
        Employee e = new Employee();

        m.addEmployee(e);
        m.removeEmployee(e);

        assertTrue(m.getEmployees().isEmpty());
        assertNull(e.getManager());
    }
}
