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

    List<Employee> findByManagerIsNull();

    @Query("""
            SELECT e FROM Employee e
            WHERE e.manager IS NULL AND (
                LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))
            )
            """)
    List<Employee> searchUnassigned(String query);

}
