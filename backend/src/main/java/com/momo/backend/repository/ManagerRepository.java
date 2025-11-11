package com.momo.backend.repository;

import com.momo.backend.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;


//                                                       Entity , PrimaryKey
public interface ManagerRepository extends JpaRepository<Manager, Long> {
}
