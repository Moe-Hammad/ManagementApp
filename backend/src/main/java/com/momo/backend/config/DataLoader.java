package com.momo.backend.config;

import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Request;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.TaskAssignment;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.entity.enums.ChatType;
import com.momo.backend.entity.enums.RequestStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.CalendarEntryRepository;
import com.momo.backend.repository.ChatRepository;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.RequestRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final ManagerRepository managerRepo;
    private final EmployeeRepository employeeRepo;
    private final RequestRepository requestRepo;
    private final ChatRepository chatRepo;
    private final TaskRepository taskRepo;
    private final CalendarEntryRepository calendarEntryRepo;
    private final UserRepository userRepo;
    private final TransactionTemplate txTemplate;

    @Bean
    ApplicationRunner loadData() {
        return args -> {
            txTemplate.executeWithoutResult(status -> {
            boolean allUsersPresent =
                    userRepo.findByEmail("manager1@mail.com").isPresent() &&
                    userRepo.findByEmail("emp1_1@mail.com").isPresent() &&
                    userRepo.findByEmail("emp1_2@mail.com").isPresent() &&
                    userRepo.findByEmail("emp1_3@mail.com").isPresent();

            boolean tasksPresent = taskRepo.count() > 0;

            // If everything is already there, skip
            if (allUsersPresent && tasksPresent) {
                return;
            }

            // Manager 1
            Manager manager1 = ensureManager(
                    "manager1@mail.com",
                    () -> {
                        Manager m = new Manager();
                        m.setFirstName("Manager");
                        m.setLastName("One");
                        m.setEmail("manager1@mail.com");
                        m.setPassword("pass123");
                        m.setRole(UserRole.MANAGER);
                        return m;
                    }
            );

            // Assigned employee for manager1
            Employee empAssigned = ensureEmployee(
                    "emp1_1@mail.com",
                    () -> {
                        Employee e = new Employee();
                        e.setFirstName("Anna");
                        e.setLastName("Assigned");
                        e.setEmail("emp1_1@mail.com");
                        e.setHourlyRate(18.5);
                        e.setAvailability(true);
                        e.setPassword("pass123");
                        e.setRole(UserRole.EMPLOYEE);
                        return e;
                    }
            );
            if (empAssigned.getManager() == null) {
                manager1.addEmployee(empAssigned);
            }
            managerRepo.save(manager1); // cascades assigned employee
            employeeRepo.save(empAssigned);

            // Unassigned employee for pending request
            Employee empPending = ensureEmployee(
                    "emp1_2@mail.com",
                    () -> {
                        Employee e = new Employee();
                        e.setFirstName("Elias");
                        e.setLastName("Pending");
                        e.setEmail("emp1_2@mail.com");
                        e.setHourlyRate(17.0);
                        e.setAvailability(true);
                        e.setPassword("pass123");
                        e.setRole(UserRole.EMPLOYEE);
                        return e;
                    }
            );
            employeeRepo.save(empPending);

            // Employee for approved request (accepted)
            Employee empApproved = ensureEmployee(
                    "emp1_3@mail.com",
                    () -> {
                        Employee e = new Employee();
                        e.setFirstName("Ben");
                        e.setLastName("Approved");
                        e.setEmail("emp1_3@mail.com");
                        e.setHourlyRate(19.0);
                        e.setAvailability(true);
                        e.setPassword("pass123");
                        e.setRole(UserRole.EMPLOYEE);
                        return e;
                    }
            );
            employeeRepo.save(empApproved);

            // Bulk dummy employees for testing (emp{i}_{j}@mail.com)
            for (int i = 1; i <= 10; i++) {
                for (int j = 1; j <= 10; j++) {
                    String email = "emp" + i + "_" + j + "@mail.com";
                    int finalI = i;
                    int finalJ = j;
                    ensureEmployee(email, () -> {
                        Employee e = new Employee();
                        e.setFirstName("Emp" + finalI);
                        e.setLastName("User" + finalJ);
                        e.setEmail(email);
                        e.setHourlyRate(15.0);
                        e.setAvailability(true);
                        e.setPassword("pass123");
                        e.setRole(UserRole.EMPLOYEE);
                        return e;
                    });
                }
            }

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
            // make sure all employees are fully persisted before tasks/assignments
            employeeRepo.flush();

            if (!tasksPresent) {
                LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

                // Finished job with two accepted assignments
                Task finishedTask = new Task();
                finishedTask.setLocation("Hamburg Messehalle 4");
                finishedTask.setCompany("Nord Event GmbH");
                finishedTask.setRequiredEmployees(2);
                finishedTask.setStart(now.minusDays(5).withHour(9).withMinute(0));
                finishedTask.setEnd(now.minusDays(5).withHour(17).withMinute(0));
                finishedTask.setResponseDeadline(finishedTask.getStart().minusDays(1));

                TaskAssignment finishedAnna = new TaskAssignment();
                finishedAnna.setEmployee(empAssigned);
                finishedAnna.setStatus(AssignmentStatus.ACCEPTED);
                finishedAnna.setRespondedAt(finishedTask.getStart().minusDays(2));
                finishedTask.addAssignment(finishedAnna);

                TaskAssignment finishedBen = new TaskAssignment();
                finishedBen.setEmployee(empApproved);
                finishedBen.setStatus(AssignmentStatus.ACCEPTED);
                finishedBen.setRespondedAt(finishedTask.getStart().minusDays(1));
                finishedTask.addAssignment(finishedBen);

                // Running task currently in progress
                Task runningTask = new Task();
                runningTask.setLocation("Berlin Lager 12");
                runningTask.setCompany("Urban Logistics AG");
                runningTask.setRequiredEmployees(1);
                runningTask.setStart(now.minusHours(1));
                runningTask.setEnd(now.plusHours(3));
                runningTask.setResponseDeadline(now.minusHours(2));

                TaskAssignment runningBen = new TaskAssignment();
                runningBen.setEmployee(empApproved);
                runningBen.setStatus(AssignmentStatus.ACCEPTED);
                runningBen.setRespondedAt(now.minusHours(1));
                runningTask.addAssignment(runningBen);

                // Upcoming open task keeps the open list populated
                Task upcomingTask = new Task();
                upcomingTask.setLocation("Muenchen Innenstadt");
                upcomingTask.setCompany("Bavaria Retail");
                upcomingTask.setRequiredEmployees(2);
                upcomingTask.setStart(now.plusDays(2).withHour(8).withMinute(30));
                upcomingTask.setEnd(now.plusDays(2).withHour(16).withMinute(0));
                upcomingTask.setResponseDeadline(upcomingTask.getStart().minusDays(1));

                manager1.addTask(finishedTask);
                manager1.addTask(runningTask);
                manager1.addTask(upcomingTask);

                taskRepo.saveAll(List.of(finishedTask, runningTask, upcomingTask));

                calendarEntryRepo.saveAll(List.of(
                        buildTaskEntry(empAssigned, finishedTask),
                        buildTaskEntry(empApproved, finishedTask),
                        buildTaskEntry(empApproved, runningTask)
                ));
            }

            // Manager 2 (optional second account)
            Manager manager2 = ensureManager(
                    "manager2@mail.com",
                    () -> {
                        Manager m = new Manager();
                        m.setFirstName("Manager");
                        m.setLastName("Two");
                        m.setEmail("manager2@mail.com");
                        m.setPassword("pass123");
                        m.setRole(UserRole.MANAGER);
                        return m;
                    }
            );
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

            System.out.println("Testdaten geladen: Manager/Employees + Requests + Tasks/Assignments + Chat");
            });
        };
    }

    private Manager ensureManager(String email, Supplier<Manager> creator) {
        return userRepo.findByEmail(email)
                .map(user -> {
                    if (!(user instanceof Manager m)) {
                        throw new IllegalStateException("Email already used by non-manager user: " + email);
                    }
                    return m;
                })
                .orElseGet(() -> managerRepo.save(creator.get()));
    }

    private Employee ensureEmployee(String email, Supplier<Employee> creator) {
        return userRepo.findByEmail(email)
                .map(user -> {
                    if (!(user instanceof Employee e)) {
                        throw new IllegalStateException("Email already used by non-employee user: " + email);
                    }
                    return e;
                })
                .orElseGet(() -> employeeRepo.save(creator.get()));
    }

    private CalendarEntry buildTaskEntry(Employee employee, Task task) {
        CalendarEntry entry = new CalendarEntry();
        entry.setEmployee(employee);
        entry.setTask(task);
        entry.setType(CalendarEntryType.TASK);
        entry.setStart(task.getStart());
        entry.setEnd(task.getEnd());
        return entry;
    }
}
