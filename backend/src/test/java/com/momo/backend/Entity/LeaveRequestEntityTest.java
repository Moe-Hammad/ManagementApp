package com.momo.backend.Entity;


import com.momo.backend.entity.*;
import com.momo.backend.entity.enums.LeaveStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class LeaveRequestEntityTest {

    @Test
    void testDefaultValues() {
        LeaveRequest req = new LeaveRequest();

        assertNull(req.getId());
        assertNull(req.getEmployee());
        assertNull(req.getStartDate());
        assertNull(req.getEndDate());
        assertNull(req.getReason());
        assertEquals(LeaveStatus.PENDING, req.getStatus());
    }

    @Test
    void testSetAndGetProperties() {
        Employee emp = new Employee();
        emp.setId(UUID.randomUUID());

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = start.plusDays(1);

        LeaveRequest req = new LeaveRequest();
        req.setId(UUID.randomUUID());
        req.setEmployee(emp);
        req.setStartDate(start);
        req.setEndDate(end);
        req.setReason("Urlaub");
        req.setStatus(LeaveStatus.APPROVED);

        assertEquals(emp, req.getEmployee());
        assertEquals(start, req.getStartDate());
        assertEquals(end, req.getEndDate());
        assertEquals("Urlaub", req.getReason());
        assertEquals(LeaveStatus.APPROVED, req.getStatus());
    }

    @Test
    void testRejectingLeaveRequest() {
        LeaveRequest req = new LeaveRequest();
        req.setStatus(LeaveStatus.REJECTED);

        assertEquals(LeaveStatus.REJECTED, req.getStatus());
    }

    @Test
    void testStartMustBeBeforeEnd() {
        LeaveRequest req = new LeaveRequest();

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.minusDays(1);

        req.setStartDate(start);
        req.setEndDate(end);

        assertTrue(req.getStartDate().isAfter(req.getEndDate()));
    }
}
