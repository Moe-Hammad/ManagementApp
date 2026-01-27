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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    private static final List<String[]> MANAGER1_TEAM_NAMES = List.of(
            new String[]{"Sofia", "Klein"},
            new String[]{"Lukas", "Bauer"},
            new String[]{"Mila", "Hoffmann"},
            new String[]{"Jonas", "Schneider"},
            new String[]{"Lea", "Fischer"},
            new String[]{"Noah", "Becker"},
            new String[]{"Emma", "Krueger"},
            new String[]{"Paul", "Neumann"},
            new String[]{"Lina", "Wolf"},
            new String[]{"Tim", "Schubert"}
    );

    private static final List<String[]> MANAGER2_TEAM_NAMES = List.of(
            new String[]{"Felix", "Brandt"},
            new String[]{"Nina", "Hartmann"},
            new String[]{"Marie", "Vogel"},
            new String[]{"Leon", "Richter"},
            new String[]{"Sara", "Koch"},
            new String[]{"David", "Zimmermann"},
            new String[]{"Jana", "Peters"},
            new String[]{"Jan", "Schulte"},
            new String[]{"Carla", "Walter"},
            new String[]{"Tom", "Friedrich"}
    );

    private static final List<String[]> UNASSIGNED_NAMES = List.of(
            new String[]{"Mara", "Seidel"},
            new String[]{"Louis", "Krause"},
            new String[]{"Hanna", "Schwarz"},
            new String[]{"Niklas", "Frank"},
            new String[]{"Tessa", "Lange"},
            new String[]{"Kevin", "Dietrich"},
            new String[]{"Melina", "Otto"},
            new String[]{"Fabian", "Jung"},
            new String[]{"Clara", "Simon"},
            new String[]{"Pascal", "Kuhn"}
    );

    private static final List<String> SEED_COMPANIES = List.of(
            "Nordlicht Logistik GmbH",
            "Rhein-Main Service GmbH",
            "Hanseatic Eventtechnik GmbH",
            "Spreewerk Facility Services",
            "Elbe Hafenservice AG",
            "Isar Catering GmbH",
            "Ruhr City Security GmbH",
            "MainCity Reinigung",
            "Koenigshof Technik GmbH",
            "Bergblick Messebau GmbH",
            "Baltic Crew Services",
            "Westpark Infrastruktur GmbH"
    );

    private static final List<String> SEED_LOCATIONS = List.of(
            "Messeplatz 1, 20357 Hamburg",
            "Friedrichstrasse 68, 10117 Berlin",
            "Koenigstrasse 5, 70173 Stuttgart",
            "Marienplatz 8, 80331 Muenchen",
            "Neumarkt 2, 50667 Koeln",
            "Hauptbahnhof 1, 60329 Frankfurt",
            "Augustusplatz 1, 04109 Leipzig",
            "Theaterplatz 1, 01067 Dresden",
            "Domplatz 1, 49074 Osnabrueck",
            "Heumarkt 20, 50667 Koeln",
            "Bismarckstrasse 45, 90402 Nuernberg",
            "Markt 1, 97070 Wuerzburg"
    );

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
                    m.setFirstName("Laura");
                    m.setLastName("Schmidt");
                    m.setEmail("manager1@mail.com");
                    m.setPassword("pass123");
                    m.setRole(UserRole.MANAGER);
                    return m;
                }
        );
        manager1.setFirstName("Laura");
        manager1.setLastName("Schmidt");
        managerRepo.save(manager1);

        Manager manager2 = ensureManager(
                "manager2@mail.com",
                () -> {
                    Manager m = new Manager();
                    m.setFirstName("Daniel");
                    m.setLastName("Weber");
                    m.setEmail("manager2@mail.com");
                    m.setPassword("pass123");
                    m.setRole(UserRole.MANAGER);
                    return m;
                }
        );
        manager2.setFirstName("Daniel");
        manager2.setLastName("Weber");
        managerRepo.save(manager2);

        // Core employees for manager1 demo requests
        Employee empAssigned = ensureEmployee(
                "emp1_1@mail.com",
                () -> {
                    Employee e = new Employee();
                    e.setFirstName("Anna");
                    e.setLastName("Keller");
                    e.setEmail("emp1_1@mail.com");
                    e.setHourlyRate(18.5);
                    e.setAvailability(true);
                    e.setPassword("pass123");
                    e.setRole(UserRole.EMPLOYEE);
                    return e;
                }
        );
        empAssigned.setFirstName("Anna");
        empAssigned.setLastName("Keller");
        empAssigned.setHourlyRate(18.5);
        empAssigned.setAvailability(true);
        if (empAssigned.getManager() == null) {
            manager1.addEmployee(empAssigned);
        }
        employeeRepo.save(empAssigned);

        Employee empPending = ensureEmployee(
                "emp1_2@mail.com",
                () -> {
                    Employee e = new Employee();
                    e.setFirstName("Elias");
                    e.setLastName("Braun");
                    e.setEmail("emp1_2@mail.com");
                    e.setHourlyRate(17.0);
                    e.setAvailability(true);
                    e.setPassword("pass123");
                    e.setRole(UserRole.EMPLOYEE);
                    return e;
                }
        );
        empPending.setFirstName("Elias");
        empPending.setLastName("Braun");
        empPending.setHourlyRate(17.0);
        empPending.setAvailability(true);
        employeeRepo.save(empPending);

        Employee empApproved = ensureEmployee(
                "emp1_3@mail.com",
                () -> {
                    Employee e = new Employee();
                    e.setFirstName("Ben");
                    e.setLastName("Wagner");
                    e.setEmail("emp1_3@mail.com");
                    e.setHourlyRate(19.0);
                    e.setAvailability(true);
                    e.setPassword("pass123");
                    e.setRole(UserRole.EMPLOYEE);
                    return e;
                }
        );
        empApproved.setFirstName("Ben");
        empApproved.setLastName("Wagner");
        empApproved.setHourlyRate(19.0);
        empApproved.setAvailability(true);
        employeeRepo.save(empApproved);

        // Teams and unassigned pool
        List<Employee> manager1Team = seedTeamForManager(manager1, "m1_team", MANAGER1_TEAM_NAMES, 17.5);
        List<Employee> manager2Team = seedTeamForManager(manager2, "m2_team", MANAGER2_TEAM_NAMES, 18.5);
        seedUnassignedEmployees(UNASSIGNED_NAMES);

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
        seedExtendedTimelineTasks(manager1, now,
                List.of(empAssigned, empApproved),
                manager1Team);
        seedExtendedTimelineTasks(manager2, now,
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

    private List<Employee> seedTeamForManager(Manager manager,
                                              String prefix,
                                              List<String[]> names,
                                              double hourlyRate) {
        List<Employee> seeded = employeeRepo.findAll().stream()
                .filter(e -> e.getManager() != null && manager.getId().equals(e.getManager().getId()))
                .collect(Collectors.toList());

        for (int i = 0; i < names.size(); i++) {
            String[] name = names.get(i);
            String email = prefix + "_" + (i + 1) + "@mail.com";
            Employee emp = ensureEmployee(email, () -> {
                Employee e = new Employee();
                e.setFirstName(name[0]);
                e.setLastName(name[1]);
                e.setEmail(email);
                e.setHourlyRate(hourlyRate);
                e.setAvailability(true);
                e.setPassword("pass123");
                e.setRole(UserRole.EMPLOYEE);
                return e;
            });
            emp.setFirstName(name[0]);
            emp.setLastName(name[1]);
            emp.setHourlyRate(hourlyRate);
            emp.setAvailability(true);
            if (emp.getManager() == null) {
                manager.addEmployee(emp);
                employeeRepo.save(emp);
            }
            if (seeded.stream().noneMatch(existing -> existing.getId().equals(emp.getId()))) {
                seeded.add(emp);
            }
        }
        managerRepo.save(manager);
        return seeded;
    }

    private void seedUnassignedEmployees(List<String[]> names) {
        for (int i = 0; i < names.size(); i++) {
            String[] name = names.get(i);
            String email = "unassigned_" + (i + 1) + "@mail.com";
            ensureEmployee(email, () -> {
                Employee e = new Employee();
                e.setFirstName(name[0]);
                e.setLastName(name[1]);
                e.setEmail(email);
                e.setHourlyRate(16.0);
                e.setAvailability(true);
                e.setPassword("pass123");
                e.setRole(UserRole.EMPLOYEE);
                return e;
            });
            Employee emp = userRepo.findByEmail(email)
                    .filter(Employee.class::isInstance)
                    .map(Employee.class::cast)
                    .orElse(null);
            if (emp != null) {
                emp.setFirstName(name[0]);
                emp.setLastName(name[1]);
                emp.setHourlyRate(16.0);
                emp.setAvailability(true);
                if (emp.getManager() != null) {
                    emp.setManager(null);
                }
                employeeRepo.save(emp);
            }
        }
    }

    private void seedTasksAndCalendar(Manager manager,
                                      LocalDateTime now,
                                      List<Employee> priorityAssignees,
                                      List<Employee> fallbackPool) {
        List<Task> existing = taskRepo.findAll();

        LocalDateTime finishedStart = now.minusDays(7).withHour(9).withMinute(0);
        LocalDateTime finishedEnd = now.minusDays(7).withHour(17).withMinute(0);
        String finishedCompany = "Nordlicht Logistik GmbH";
        String finishedLocation = "Messeplatz 1, 20357 Hamburg";
        Task finishedTask = findTask(existing, manager, finishedCompany, finishedLocation, finishedStart, finishedEnd);
        if (finishedTask == null) {
            finishedTask = buildTask(manager,
                    finishedCompany,
                    finishedLocation,
                    finishedStart,
                    finishedEnd,
                    2,
                    now.minusDays(8));
            addAssignmentWithStatus(finishedTask, priorityAssignees, AssignmentStatus.ACCEPTED, finishedTask.getStart().minusDays(1));
            saveTaskWithCalendar(finishedTask);
        }

        LocalDateTime runningStart = now.minusHours(2);
        LocalDateTime runningEnd = now.plusHours(4);
        String runningCompany = "Spreewerk Facility Services";
        String runningLocation = "Friedrichstrasse 68, 10117 Berlin";
        Task runningTask = findTask(existing, manager, runningCompany, runningLocation, runningStart, runningEnd);
        if (runningTask == null) {
            runningTask = buildTask(manager,
                    runningCompany,
                    runningLocation,
                    runningStart,
                    runningEnd,
                    2,
                    now.minusHours(3));
            addAssignmentWithStatus(runningTask, priorityAssignees, AssignmentStatus.ACCEPTED, now.minusHours(2));
            saveTaskWithCalendar(runningTask);
        }

        LocalDateTime upcomingStart = now.plusDays(3).withHour(8).withMinute(30);
        LocalDateTime upcomingEnd = now.plusDays(3).withHour(16).withMinute(0);
        String upcomingCompany = "Isar Catering GmbH";
        String upcomingLocation = "Marienplatz 8, 80331 Muenchen";
        Task upcomingTask = findTask(existing, manager, upcomingCompany, upcomingLocation, upcomingStart, upcomingEnd);
        if (upcomingTask == null) {
            upcomingTask = buildTask(manager,
                    upcomingCompany,
                    upcomingLocation,
                    upcomingStart,
                    upcomingEnd,
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

    private void seedExtendedTimelineTasks(Manager manager,
                                           LocalDateTime now,
                                           List<Employee> priorityAssignees,
                                           List<Employee> fallbackPool) {
        LocalDate endDate = LocalDate.of(now.getYear(), 2, 26);
        if (endDate.isBefore(now.toLocalDate())) {
            endDate = endDate.plusYears(1);
        }
        LocalDate startDate = now.toLocalDate().minusDays(21);

        List<Task> existing = taskRepo.findAll();
        List<Employee> pool = new ArrayList<>();
        pool.addAll(priorityAssignees);
        pool.addAll(fallbackPool);
        if (pool.isEmpty()) {
            return;
        }

        int seedIndex = 1;
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(4)) {
            String company = pickFromList(SEED_COMPANIES, seedIndex);
            String location = pickFromList(SEED_LOCATIONS, seedIndex);
            LocalDateTime start = date.atTime(9, 0);
            LocalDateTime end = date.atTime(17, 0);
            if (findTask(existing, manager, company, location, start, end) != null) {
                seedIndex++;
                continue;
            }

            Task task = buildTask(manager, company, location, start, end, 3, start.minusDays(1));

            List<Employee> sample = sampleEmployees(pool, seedIndex, 3);
            if (date.isBefore(now.toLocalDate())) {
                addAssignmentWithStatus(
                        task,
                        sample.subList(0, Math.min(2, sample.size())),
                        AssignmentStatus.ACCEPTED,
                        start.minusDays(1));
                if (sample.size() > 2) {
                    addAssignmentWithStatus(
                            task,
                            sample.subList(2, 3),
                            AssignmentStatus.DECLINED,
                            start.minusDays(1));
                }
            } else if (date.isEqual(now.toLocalDate())) {
                addAssignmentWithStatus(
                        task,
                        sample.subList(0, Math.min(2, sample.size())),
                        AssignmentStatus.ACCEPTED,
                        now.minusHours(1));
            } else {
                if (!sample.isEmpty()) {
                    addAssignmentWithStatus(
                            task,
                            sample.subList(0, 1),
                            AssignmentStatus.PENDING,
                            now.minusHours(2));
                }
                if (seedIndex % 2 == 0 && sample.size() > 1) {
                    addAssignmentWithStatus(
                            task,
                            sample.subList(1, 2),
                            AssignmentStatus.ACCEPTED,
                            now.minusHours(3));
                }
            }

            saveTaskWithCalendar(task);
            existing.add(task);
            seedIndex++;
        }

        String endCompany = pickFromList(SEED_COMPANIES, 0);
        String endLocation = pickFromList(SEED_LOCATIONS, 0);
        LocalDateTime start = endDate.atTime(10, 0);
        if (findTask(existing, manager, endCompany, endLocation, start, start.plusHours(6)) == null) {
            Task endTask = buildTask(
                    manager,
                    endCompany,
                    endLocation,
                    start,
                    start.plusHours(6),
                    2,
                    start.minusDays(1));
            List<Employee> sample = sampleEmployees(pool, 0, 2);
            addAssignmentWithStatus(endTask, sample, AssignmentStatus.ACCEPTED, start.minusDays(1));
            saveTaskWithCalendar(endTask);
        }
    }

    private List<Employee> sampleEmployees(List<Employee> pool, int startIndex, int count) {
        List<Employee> picked = new ArrayList<>();
        for (int i = 0; i < count && i < pool.size(); i++) {
            picked.add(pool.get((startIndex + i) % pool.size()));
        }
        return picked;
    }

    private String pickFromList(List<String> list, int index) {
        int safeIndex = Math.abs(index) % list.size();
        return list.get(safeIndex);
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

    private Task findTask(List<Task> existing,
                          Manager manager,
                          String company,
                          String location,
                          LocalDateTime start,
                          LocalDateTime end) {
        return existing.stream()
                .filter(t -> manager.getId().equals(t.getManager().getId()))
                .filter(t -> company.equals(t.getCompany()) && location.equals(t.getLocation()))
                .filter(t -> start.equals(t.getStart()) && end.equals(t.getEnd()))
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
