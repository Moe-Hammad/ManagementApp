package com.momo.backend.repository;

import com.momo.backend.entity.Request;
import com.momo.backend.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<Request, UUID> {

    List<Request> findByManagerId(UUID managerId);

    List<Request> findByEmployeeId(UUID employeeId);

    @Query("SELECT r FROM Request r WHERE r.employee.manager IS NULL AND r.status = :status")
    List<Request> findPendingForUnassigned(RequestStatus status);
}
