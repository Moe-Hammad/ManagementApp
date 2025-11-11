package com.momo.backend.repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


//                                                       Entity , PrimaryKey
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
