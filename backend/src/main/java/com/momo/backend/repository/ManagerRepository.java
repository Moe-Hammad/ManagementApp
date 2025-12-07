package com.momo.backend.repository;

import com.momo.backend.entity.LeaveRequest;
import com.momo.backend.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ManagerRepository extends JpaRepository<Manager, UUID> {

    Optional<Manager> findByEmail(String email);

}
