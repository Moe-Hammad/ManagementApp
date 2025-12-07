package com.momo.backend.repository;

import com.momo.backend.entity.LeaveRequest;
import com.momo.backend.entity.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByEmployeeId(UUID employeeId);

    List<LeaveRequest> findByEmployeeManagerId(UUID managerId);

    List<LeaveRequest> findByStatus(LeaveStatus status);
}
