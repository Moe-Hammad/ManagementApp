package com.momo.backend.repository;

import com.momo.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    List<Employee> findByManagerId(UUID managerId);

    @Query("SELECT c FROM CalendarEntry c WHERE c.employee.manager.id = :managerId")
    List<CalendarEntry> findCalendarEntriesByManagerId(UUID managerId);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.manager.id = :managerId")
    List<LeaveRequest> findLeaveRequestsByManagerId(UUID managerId);

}
