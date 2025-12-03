package com.momo.backend.config;

import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Request;
import com.momo.backend.entity.enums.ChatType;
import com.momo.backend.entity.enums.RequestStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.ChatRepository;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final ManagerRepository managerRepo;
    private final EmployeeRepository employeeRepo;
    private final RequestRepository requestRepo;
    private final ChatRepository chatRepo;

    @Bean
    ApplicationRunner loadData() {
        return args -> {
            // Skip seeding if data already present
            if (managerRepo.count() > 0) {
                return;
            }

            // Manager 1
            Manager manager1 = new Manager();
            manager1.setFirstName("Manager");
            manager1.setLastName("One");
            manager1.setEmail("manager1@mail.com");
            manager1.setPassword("pass123");
            manager1.setRole(UserRole.MANAGER);
            managerRepo.save(manager1);

            // Assigned employee for manager1
            Employee empAssigned = new Employee();
            empAssigned.setFirstName("Anna");
            empAssigned.setLastName("Assigned");
            empAssigned.setEmail("employee_assigned@mail.com");
            empAssigned.setHourlyRate(18.5);
            empAssigned.setAvailability(true);
            empAssigned.setPassword("pass123");
            empAssigned.setRole(UserRole.EMPLOYEE);
            manager1.addEmployee(empAssigned);
            managerRepo.save(manager1); // cascades assigned employee

            // Unassigned employee for pending request
            Employee empPending = new Employee();
            empPending.setFirstName("Elias");
            empPending.setLastName("Pending");
            empPending.setEmail("employee_pending@mail.com");
            empPending.setHourlyRate(17.0);
            empPending.setAvailability(true);
            empPending.setPassword("pass123");
            empPending.setRole(UserRole.EMPLOYEE);
            employeeRepo.save(empPending);

            // Employee for approved request (accepted)
            Employee empApproved = new Employee();
            empApproved.setFirstName("Ben");
            empApproved.setLastName("Approved");
            empApproved.setEmail("employee_approved@mail.com");
            empApproved.setHourlyRate(19.0);
            empApproved.setAvailability(true);
            empApproved.setPassword("pass123");
            empApproved.setRole(UserRole.EMPLOYEE);
            employeeRepo.save(empApproved);

            // Pending request from manager1 to empPending
            Request pendingReq = new Request();
            pendingReq.setManager(manager1);
            pendingReq.setEmployee(empPending);
            pendingReq.setMessage("Bitte schließe dich meinem Team an.");
            pendingReq.setStatus(RequestStatus.PENDING);
            requestRepo.save(pendingReq);

            // Approved request from manager1 to empApproved
            Request approvedReq = new Request();
            approvedReq.setManager(manager1);
            approvedReq.setEmployee(empApproved);
            approvedReq.setMessage("Willkommen im Team!");
            approvedReq.setStatus(RequestStatus.APPROVED);
            requestRepo.save(approvedReq);
            // reflect assignment
            empApproved.setManager(manager1);
            employeeRepo.save(empApproved);

            // Manager 2 (optional second account)
            Manager manager2 = new Manager();
            manager2.setFirstName("Manager");
            manager2.setLastName("Two");
            manager2.setEmail("manager2@mail.com");
            manager2.setPassword("pass123");
            manager2.setRole(UserRole.MANAGER);
            managerRepo.save(manager2);

            // Seed a direct chat between manager1 and empApproved
            Chat chat = new Chat();
            chat.setType(ChatType.DIRECT);
            chat.setManagerId(manager1.getId());
            chat.setName("Direct Chat Seed");
            Set<java.util.UUID> members = new HashSet<>();
            members.add(manager1.getId());
            members.add(empApproved.getId());
            chat.setMemberIds(members);
            chat.setCreatedAt(LocalDateTime.now());
            chatRepo.save(chat);

            System.out.println("✅ Testdaten geladen: Manager/Employees + Requests + Chat");
        };
    }
}
