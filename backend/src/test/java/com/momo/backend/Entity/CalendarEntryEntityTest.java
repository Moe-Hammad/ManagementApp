package com.momo.backend.Entity;


import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.CalendarEntryType;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CalendarEntryEntityTest {

    @Test
    void testCalendarEntryDefaultValues() {
        CalendarEntry entry = new CalendarEntry();

        assertNull(entry.getId());
        assertNull(entry.getEmployee());
        assertNull(entry.getTask());
        assertNull(entry.getType());
        assertNull(entry.getStart());
        assertNull(entry.getEnd());
    }

    @Test
    void testSetAndGetProperties() {
        Employee emp = new Employee();
        emp.setId(UUID.randomUUID());

        Task task = new Task();
        task.setId(UUID.randomUUID());

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = start.plusHours(5);

        CalendarEntry entry = new CalendarEntry();
        entry.setId(UUID.randomUUID());
        entry.setEmployee(emp);
        entry.setTask(task);
        entry.setType(CalendarEntryType.VACATION);
        entry.setStart(start);
        entry.setEnd(end);

        assertEquals(emp, entry.getEmployee());
        assertEquals(task, entry.getTask());
        assertEquals(CalendarEntryType.VACATION, entry.getType());
        assertEquals(start, entry.getStart());
        assertEquals(end, entry.getEnd());
    }

    @Test
    void testEntryWithoutTaskIsAllowed() {
        Employee emp = new Employee();
        emp.setId(UUID.randomUUID());

        CalendarEntry entry = new CalendarEntry();
        entry.setEmployee(emp);
        entry.setType(CalendarEntryType.SICK);
        entry.setStart(LocalDateTime.now());
        entry.setEnd(LocalDateTime.now().plusHours(3));

        assertNull(entry.getTask()); // task optional
        assertNotNull(entry.getEmployee());
    }

    @Test
    void testStartMustBeBeforeEnd() {
        CalendarEntry entry = new CalendarEntry();
        LocalDateTime now = LocalDateTime.now();

        entry.setStart(now);
        entry.setEnd(now.minusHours(1)); // ungültig

        assertTrue(entry.getStart().isAfter(entry.getEnd()));
    }
}
