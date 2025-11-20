package com.momo.backend.Repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.LeaveRequest;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.enums.LeaveStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.LeaveRequestRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class LeaveRequestRepositoryTest {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    private Employee createEmployeeWithManager() {
        Manager manager = new Manager();
        manager.setFirstName("Boss");
        manager.setLastName("Man");
        manager.setEmail("boss@mail.com");
        manager.setPassword("aaa");
        manager.setRole(UserRole.MANAGER);
        userRepository.save(manager);

        Employee emp = new Employee();
        emp.setFirstName("Emp");
        emp.setLastName("Worker");
        emp.setEmail("emp@mail.com");
        emp.setPassword("bbb");
        emp.setRole(UserRole.EMPLOYEE);
        emp.setManager(manager);
        userRepository.save(emp);

        return emp;
    }

    // --------------------------------------------------------------------
    // POSITIV 1: Save LeaveRequest
    // --------------------------------------------------------------------
    @Test
    void testSaveLeaveRequest() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req = new LeaveRequest();
        req.setEmployee(emp);
        req.setStartDate(LocalDateTime.now().plusDays(1));
        req.setEndDate(LocalDateTime.now().plusDays(2));
        req.setReason("Urlaub");

        leaveRequestRepository.save(req);

        LeaveRequest saved = leaveRequestRepository.findById(req.getId()).orElse(null);

        assertNotNull(saved);
        assertEquals("Urlaub", saved.getReason());
        assertEquals(emp.getId(), saved.getEmployee().getId());
        assertEquals(LeaveStatus.PENDING, saved.getStatus());
    }

    // --------------------------------------------------------------------
    // POSITIV 2: findByEmployeeId
    // --------------------------------------------------------------------
    @Test
    void testFindByEmployeeId() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req = new LeaveRequest();
        req.setEmployee(emp);
        req.setStartDate(LocalDateTime.now().plusDays(1));
        req.setEndDate(LocalDateTime.now().plusDays(3));
        req.setReason("Travel");

        leaveRequestRepository.save(req);

        List<LeaveRequest> results = leaveRequestRepository.findByEmployeeId(emp.getId());

        assertEquals(1, results.size());
        assertEquals("Travel", results.getFirst().getReason());
    }

    // --------------------------------------------------------------------
    // POSITIV 3: findByManagerId
    // --------------------------------------------------------------------
    @Test
    void testFindByEmployeeManagerId() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req1 = new LeaveRequest();
        req1.setEmployee(emp);
        req1.setStartDate(LocalDateTime.now().plusDays(1));
        req1.setEndDate(LocalDateTime.now().plusDays(2));
        req1.setReason("Urlaub");

        leaveRequestRepository.save(req1);

        List<LeaveRequest> results = leaveRequestRepository.findByEmployeeManagerId(emp.getManager().getId());

        assertEquals(1, results.size());
        assertEquals("Urlaub", results.getFirst().getReason());
    }

    // --------------------------------------------------------------------
    // POSITIV 4: findByStatus
    // --------------------------------------------------------------------
    @Test
    void testFindByStatus() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req = new LeaveRequest();
        req.setEmployee(emp);
        req.setStartDate(LocalDateTime.now().plusDays(1));
        req.setEndDate(LocalDateTime.now().plusDays(2));
        req.setReason("Sick");
        req.setStatus(LeaveStatus.APPROVED);

        leaveRequestRepository.save(req);

        List<LeaveRequest> results = leaveRequestRepository.findByStatus(LeaveStatus.APPROVED);

        assertEquals(1, results.size());
        assertEquals("Sick", results.getFirst().getReason());
    }

    // --------------------------------------------------------------------
    // NEGATIV 1: Manager does not exist
    // --------------------------------------------------------------------
    @Test
    void testFindByEmployeeManagerId_NoSuchManager() {
        List<LeaveRequest> results =
                leaveRequestRepository.findByEmployeeManagerId(UUID.randomUUID());

        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    // --------------------------------------------------------------------
    // NEGATIV 2: Saving without employee → exception
    // --------------------------------------------------------------------
    @Test
    void testCannotSaveWithoutEmployee() {
        LeaveRequest req = new LeaveRequest();
        req.setStartDate(LocalDateTime.now());
        req.setEndDate(LocalDateTime.now().plusDays(1));
        req.setReason("Test");

        assertThrows(Exception.class, () -> {
            leaveRequestRepository.save(req);
            leaveRequestRepository.flush();
        });
    }

    // --------------------------------------------------------------------
    // NEGATIV 3: Saving without start/end
    // --------------------------------------------------------------------
    @Test
    void testCannotSaveWithoutStartOrEnd() {
        Employee emp = createEmployeeWithManager();

        LeaveRequest req = new LeaveRequest();
        req.setEmployee(emp);

        // missing dates
        assertThrows(Exception.class, () -> {
            leaveRequestRepository.save(req);
            leaveRequestRepository.flush();
        });
    }
}
