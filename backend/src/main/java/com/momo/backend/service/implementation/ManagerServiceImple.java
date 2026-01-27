package com.momo.backend.service.implementation;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.TaskAssignment;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.EmployeeMapper;
import com.momo.backend.mapper.ManagerMapper;
import com.momo.backend.mapper.UserMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.TaskAssignmentRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.ManagerService;
import com.momo.backend.service.interfaces.TaskAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerServiceImple extends AbstractSecuredService implements ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final TaskAssignmentService taskAssignmentService;
    private final ManagerMapper managerMapper;
    private final EmployeeMapper employeeMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // ----------------------
    // REGISTER
    // ----------------------
    @Override
    public UserDto registerManager(RegisterRequest request) {
        Manager manager = new Manager();
        manager.setFirstName(request.getFirstName());
        manager.setLastName(request.getLastName());
        manager.setEmail(request.getEmail());
        manager.setPassword(request.getPassword());
        manager.setRole(UserRole.MANAGER);

        Manager saved = managerRepository.save(manager);
        return userMapper.managerToUserDto(saved);
    }

    @Override
    public ManagerDto createManager(ManagerDto managerDto) {
        Manager manager = managerMapper.toEntity(managerDto);
        Manager saved = managerRepository.save(manager);
        return managerMapper.toDto(saved);
    }

    // ----------------------
    // READ
    // ----------------------
    @Override
    public ManagerDto getManagerById(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        return managerMapper.toDto(manager);
    }

    @Override
    public ManagerDto getManagerByEmail(String email) {
        Manager manager = managerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        return managerMapper.toDto(manager);
    }

    @Override
    public List<EmployeeDto> getAllEmployeesUnderManager(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        List<Employee> employees = employeeRepository.findByManagerId(managerId);

        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    // ----------------------
    // UPDATE
    // ----------------------
    @Override
    @Transactional
    public ManagerDto updateManager(UUID managerId, ManagerDto updateManager) {

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        manager.setFirstName(updateManager.getFirstName());
        manager.setLastName(updateManager.getLastName());
        manager.setEmail(updateManager.getEmail());

        return managerMapper.toDto(managerRepository.save(manager));
    }

    // ----------------------
    // DELETE
    // ----------------------
    @Override
    public void deleteManager(UUID managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        managerRepository.delete(manager);
    }

    // ----------------------
    // RELATIONS
    // ----------------------
    @Override
    @Transactional
    public void addEmployee(UUID managerId, UUID employeeId) {

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        manager.addEmployee(employee);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID managerId, UUID employeeId) {
        UUID currentManager = requireManagerAndGetId();
        if (!currentManager.equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Employees entfernen.");
        }

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getManager() == null || !Objects.equals(employee.getManager().getId(), managerId)) {
            throw new CustomAccessDeniedException("Employee gehoert nicht zu diesem Manager.");
        }

        manager.removeEmployee(employee);
        employeeRepository.save(employee);

        LocalDateTime now = LocalDateTime.now();
        List<Task> futureTasks = taskRepository.findByManagerId(managerId).stream()
                .filter(task -> task.getStart().isAfter(now))
                .collect(Collectors.toList());

        List<Employee> candidates = employeeRepository.findByManagerId(managerId);

        for (Task task : futureTasks) {
            List<TaskAssignment> taskAssignments = taskAssignmentRepository.findByTaskId(task.getId());
            TaskAssignment removed = taskAssignments.stream()
                    .filter(a -> a.getEmployee().getId().equals(employeeId))
                    .findFirst()
                    .orElse(null);
            if (removed == null) {
                continue;
            }

            if (removed.getStatus() != AssignmentStatus.DECLINED) {
                taskAssignmentService.updateStatus(removed.getId(), AssignmentStatus.DECLINED);
            }

            long activeCount = taskAssignments.stream()
                    .filter(a -> !a.getEmployee().getId().equals(employeeId))
                    .filter(a -> a.getStatus() == AssignmentStatus.ACCEPTED || a.getStatus() == AssignmentStatus.PENDING)
                    .count();

            if (activeCount >= task.getRequiredEmployees()) {
                continue;
            }

            Employee replacement = findReplacementEmployee(candidates, task, taskAssignments);
            if (replacement != null) {
                TaskAssignmentDto dto = new TaskAssignmentDto();
                dto.setTaskId(task.getId());
                dto.setEmployeeId(replacement.getId());
                dto.setStatus(AssignmentStatus.PENDING);
                taskAssignmentService.createAssignment(dto);
            }
        }
    }

    private Employee findReplacementEmployee(
            List<Employee> candidates,
            Task task,
            List<TaskAssignment> taskAssignments
    ) {
        for (Employee candidate : candidates) {
            if (isAssignedToTask(candidate, taskAssignments)) {
                continue;
            }
            if (isEmployeeFreeForTask(candidate, task)) {
                return candidate;
            }
        }
        return null;
    }

    private boolean isAssignedToTask(Employee candidate, List<TaskAssignment> taskAssignments) {
        return taskAssignments.stream()
                .anyMatch(a ->
                        a.getEmployee().getId().equals(candidate.getId()) &&
                                a.getStatus() != AssignmentStatus.DECLINED &&
                                a.getStatus() != AssignmentStatus.EXPIRED
                );
    }

    private boolean isEmployeeFreeForTask(Employee candidate, Task task) {
        List<TaskAssignment> assignments = taskAssignmentRepository.findByEmployeeId(candidate.getId());
        for (TaskAssignment assignment : assignments) {
            if (assignment.getTask().getId().equals(task.getId())) {
                continue;
            }
            if (assignment.getStatus() == AssignmentStatus.DECLINED ||
                    assignment.getStatus() == AssignmentStatus.EXPIRED) {
                continue;
            }
            if (overlaps(task.getStart(), task.getEnd(),
                    assignment.getTask().getStart(), assignment.getTask().getEnd())) {
                return false;
            }
        }
        return true;
    }

    private boolean overlaps(LocalDateTime startA, LocalDateTime endA,
                             LocalDateTime startB, LocalDateTime endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }

}
