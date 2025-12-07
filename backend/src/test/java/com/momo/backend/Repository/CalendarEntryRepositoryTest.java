package com.momo.backend.Repository;

import com.momo.backend.entity.*;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.repository.CalendarEntryRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CalendarEntryRepositoryTest {

    @Autowired
    private CalendarEntryRepository calRepo;

    @Autowired
    private UserRepository userRepo;

    private Manager createManager(String name) {
        Manager m = new Manager();
        m.setFirstName(name);
        m.setLastName("Boss");
        m.setEmail(name.toLowerCase() + "@mail.com");
        m.setPassword("123");
        return userRepo.save(m);
    }

    private Employee createEmployee(String name, Manager manager) {
        Employee e = new Employee();
        e.setFirstName(name);
        e.setLastName("Worker");
        e.setEmail(name.toLowerCase() + "@mail.com");
        e.setPassword("123");
        e.setManager(manager);
        return userRepo.save(e);
    }

    private CalendarEntry createEntry(Employee e, CalendarEntryType type) {
        CalendarEntry ce = new CalendarEntry();
        ce.setEmployee(e);
        ce.setType(type);
        ce.setStart(LocalDateTime.now());
        ce.setEnd(LocalDateTime.now().plusHours(1));
        return calRepo.save(ce);
    }

    @Test
    void testFindByEmployeeManagerId() {
        Manager m = createManager("Boss1");
        Employee e1 = createEmployee("A", m);
        Employee e2 = createEmployee("B", m);

        createEntry(e1, CalendarEntryType.TASK);
        createEntry(e2, CalendarEntryType.VACATION);

        List<CalendarEntry> result = calRepo.findByEmployeeManagerId(m.getId());

        assertEquals(2, result.size());
    }

    @Test
    void testFindByEmployeeManagerId_NoSuchManager() {
        List<CalendarEntry> result = calRepo.findByEmployeeManagerId(UUID.randomUUID());
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindByEmployeeId() {
        Manager m = createManager("BossX");
        Employee e = createEmployee("WorkerX", m);

        createEntry(e, CalendarEntryType.SICK);

        List<CalendarEntry> result = calRepo.findByEmployeeId(e.getId());
        assertEquals(1, result.size());
    }

    @Test
    void testCannotSaveWithoutEmployee() {
        CalendarEntry ce = new CalendarEntry();
        ce.setType(CalendarEntryType.SICK);
        ce.setStart(LocalDateTime.now());
        ce.setEnd(LocalDateTime.now().plusHours(1));

        assertThrows(Exception.class, () -> {
            calRepo.save(ce);
            calRepo.flush();
        });
    }
}
