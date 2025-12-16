package com.momo.backend.config;

import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Message;
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
import com.momo.backend.repository.MessageRepository;
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
import java.util.stream.Collectors;

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
    private final MessageRepository messageRepo;
    private final TransactionTemplate txTemplate;

    @Bean
    ApplicationRunner loadData() {
        return args -> txTemplate.executeWithoutResult(status -> seed());
    }

    private void seed() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        // Managers
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

        // Core employees for manager1 demo requests
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
        employeeRepo.save(empAssigned);

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

        // Teams and unassigned pool
        List<Employee> manager1Team = seedTeamForManager(manager1, "m1_team", 10, 17.5);
        List<Employee> manager2Team = seedTeamForManager(manager2, "m2_team", 10, 18.5);
        seedUnassignedEmployees(10);

        // Requests (idempotent)
        if (!requestRepo.existsByManagerIdAndEmployeeId(manager1.getId(), empPending.getId())) {
            Request pendingReq = new Request();
            pendingReq.setManager(manager1);
            pendingReq.setEmployee(empPending);
            pendingReq.setMessage("Bitte schliesse dich meinem Team an.");
            pendingReq.setStatus(RequestStatus.PENDING);
            requestRepo.save(pendingReq);
        }

        if (!requestRepo.existsByManagerIdAndEmployeeId(manager1.getId(), empApproved.getId())) {
            Request approvedReq = new Request();
            approvedReq.setManager(manager1);
            approvedReq.setEmployee(empApproved);
            approvedReq.setMessage("Willkommen im Team!");
            approvedReq.setStatus(RequestStatus.APPROVED);
            requestRepo.save(approvedReq);
            empApproved.setManager(manager1);
            employeeRepo.save(empApproved);
        }
        employeeRepo.flush();

        // Tasks + calendar entries
        seedTasksAndCalendar(manager1, now,
                List.of(empAssigned, empApproved),
                manager1Team);
        seedTasksAndCalendar(manager2, now,
                manager2Team.stream().limit(2).collect(Collectors.toList()),
                manager2Team);

        // Chats + messages (direct chats manager<->employee; groups for employees)
        seedChatsAndMessages(manager1, empApproved, manager1Team);
        seedChatsAndMessages(manager2, manager2Team.isEmpty() ? empApproved : manager2Team.get(0), manager2Team);

        System.out.println("Testdaten geladen: Manager/Employees + Requests + Tasks/Assignments + Chats/Messages");
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

    private List<Employee> seedTeamForManager(Manager manager, String prefix, int count, double hourlyRate) {
        List<Employee> seeded = employeeRepo.findAll().stream()
                .filter(e -> e.getManager() != null && manager.getId().equals(e.getManager().getId()))
                .collect(Collectors.toList());

        for (int i = 1; i <= count; i++) {
            String email = prefix + "_" + i + "@mail.com";
            int finalI = i;
            Employee emp = ensureEmployee(email, () -> {
                Employee e = new Employee();
                e.setFirstName(prefix.toUpperCase());
                e.setLastName("User" + finalI);
                e.setEmail(email);
                e.setHourlyRate(hourlyRate);
                e.setAvailability(true);
                e.setPassword("pass123");
                e.setRole(UserRole.EMPLOYEE);
                return e;
            });
            if (emp.getManager() == null) {
                manager.addEmployee(emp);
                employeeRepo.save(emp);
            }
            seeded.add(emp);
        }
        managerRepo.save(manager);
        return seeded;
    }

    private void seedUnassignedEmployees(int count) {
        for (int i = 1; i <= count; i++) {
            String email = "unassigned_" + i + "@mail.com";
            int finalI = i;
            ensureEmployee(email, () -> {
                Employee e = new Employee();
                e.setFirstName("Unassigned");
                e.setLastName("Emp" + finalI);
                e.setEmail(email);
                e.setHourlyRate(16.0);
                e.setAvailability(true);
                e.setPassword("pass123");
                e.setRole(UserRole.EMPLOYEE);
                return e;
            });
        }
    }

    private void seedTasksAndCalendar(Manager manager,
                                      LocalDateTime now,
                                      List<Employee> priorityAssignees,
                                      List<Employee> fallbackPool) {
        List<Task> existing = taskRepo.findAll();

        Task finishedTask = findTask(existing, "Seed - Finished - " + manager.getEmail(), "Hamburg Messehalle 4");
        if (finishedTask == null) {
            finishedTask = buildTask(manager,
                    "Seed - Finished - " + manager.getEmail(),
                    "Hamburg Messehalle 4",
                    now.minusDays(7).withHour(9).withMinute(0),
                    now.minusDays(7).withHour(17).withMinute(0),
                    2,
                    now.minusDays(8));
            addAssignmentWithStatus(finishedTask, priorityAssignees, AssignmentStatus.ACCEPTED, finishedTask.getStart().minusDays(1));
            saveTaskWithCalendar(finishedTask);
        }

        Task runningTask = findTask(existing, "Seed - Running - " + manager.getEmail(), "Berlin Lager 12");
        if (runningTask == null) {
            runningTask = buildTask(manager,
                    "Seed - Running - " + manager.getEmail(),
                    "Berlin Lager 12",
                    now.minusHours(2),
                    now.plusHours(4),
                    2,
                    now.minusHours(3));
            addAssignmentWithStatus(runningTask, priorityAssignees, AssignmentStatus.ACCEPTED, now.minusHours(2));
            saveTaskWithCalendar(runningTask);
        }

        Task upcomingTask = findTask(existing, "Seed - Upcoming - " + manager.getEmail(), "Muenchen Innenstadt");
        if (upcomingTask == null) {
            upcomingTask = buildTask(manager,
                    "Seed - Upcoming - " + manager.getEmail(),
                    "Muenchen Innenstadt",
                    now.plusDays(3).withHour(8).withMinute(30),
                    now.plusDays(3).withHour(16).withMinute(0),
                    3,
                    now.plusDays(2));
            if (!fallbackPool.isEmpty()) {
                addAssignmentWithStatus(upcomingTask,
                        fallbackPool.subList(0, Math.min(1, fallbackPool.size())),
                        AssignmentStatus.ACCEPTED,
                        now.plusDays(1));
            }
            saveTaskWithCalendar(upcomingTask);
        }
    }

    private Task buildTask(Manager manager,
                           String company,
                           String location,
                           LocalDateTime start,
                           LocalDateTime end,
                           int requiredEmployees,
                           LocalDateTime responseDeadline) {
        Task task = new Task();
        task.setCompany(company);
        task.setLocation(location);
        task.setStart(start);
        task.setEnd(end);
        task.setRequiredEmployees(requiredEmployees);
        task.setResponseDeadline(responseDeadline);
        manager.addTask(task);
        return task;
    }

    private Task findTask(List<Task> existing, String company, String location) {
        return existing.stream()
                .filter(t -> company.equals(t.getCompany()) && location.equals(t.getLocation()))
                .findFirst()
                .orElse(null);
    }

    private void addAssignmentWithStatus(Task task,
                                         List<Employee> employees,
                                         AssignmentStatus status,
                                         LocalDateTime respondedAt) {
        employees.forEach(emp -> {
            TaskAssignment assignment = new TaskAssignment();
            assignment.setEmployee(emp);
            assignment.setStatus(status);
            assignment.setRespondedAt(respondedAt);
            task.addAssignment(assignment);
        });
    }

    private void saveTaskWithCalendar(Task task) {
        taskRepo.save(task);
        List<CalendarEntry> entries = task.getAssignments().stream()
                .map(a -> buildTaskEntry(a.getEmployee(), task))
                .collect(Collectors.toList());
        calendarEntryRepo.saveAll(entries);
    }

    private void seedChatsAndMessages(Manager manager, Employee primaryEmployee, List<Employee> team) {
        String directName = "Seed Direct - " + manager.getEmail();
        if (!chatExists(directName)) {
            Chat direct = new Chat();
            direct.setType(ChatType.DIRECT);
            direct.setManagerId(manager.getId());
            direct.setName(directName);
            Set<java.util.UUID> members = new HashSet<>();
            members.add(manager.getId());
            members.add(primaryEmployee.getId());
            direct.setMemberIds(members);
            direct.setCreatedAt(LocalDateTime.now());
            chatRepo.save(direct);

            seedMessage(direct, manager.getId(), UserRole.MANAGER.name(), "Willkommen im Team, lass uns starten!", LocalDateTime.now().minusHours(6));
            seedMessage(direct, primaryEmployee.getId(), UserRole.EMPLOYEE.name(), "Danke! Ich bin bereit und schaue mir den Task an.", LocalDateTime.now().minusHours(5).plusMinutes(10));
        }

        String groupName = "Seed Crew - " + manager.getEmail();
        if (!chatExists(groupName)) {
            Chat group = new Chat();
            group.setType(ChatType.GROUP);
            group.setManagerId(manager.getId());
            group.setName(groupName);
            Set<java.util.UUID> members = new HashSet<>();
            members.add(manager.getId());
            team.stream().limit(4).forEach(e -> members.add(e.getId()));
            group.setMemberIds(members);
            group.setCreatedAt(LocalDateTime.now().minusDays(1));
            chatRepo.save(group);

            seedMessage(group, manager.getId(), UserRole.MANAGER.name(), "Hallo zusammen, bitte Status fuer das Berlin-Projekt teilen.", LocalDateTime.now().minusHours(20));
            if (!team.isEmpty()) {
                seedMessage(group, team.get(0).getId(), UserRole.EMPLOYEE.name(), "Bin gerade vor Ort, alles on track.", LocalDateTime.now().minusHours(19).plusMinutes(15));
            }
            if (team.size() > 1) {
                seedMessage(group, team.get(1).getId(), UserRole.EMPLOYEE.name(), "Anfahrt dauert 15 Minuten, ich bin gleich da.", LocalDateTime.now().minusHours(19).plusMinutes(40));
            }
        }
    }

    private void seedMessage(Chat chat, java.util.UUID senderId, String senderRole, String text, LocalDateTime createdAt) {
        Message msg = new Message();
        msg.setChat(chat);
        msg.setSenderId(senderId);
        msg.setSenderRole(senderRole);
        msg.setText(text);
        msg.setCreatedAt(createdAt);
        messageRepo.save(msg);
    }

    private boolean chatExists(String name) {
        return chatRepo.findAll().stream().anyMatch(c -> name.equals(c.getName()));
    }
}
