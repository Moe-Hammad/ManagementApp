package com.momo.backend.service.implementation;

import com.momo.backend.dto.CalendarEntryDto;
import com.momo.backend.dto.CalendarEventDto;
import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.repository.CalendarEntryRepository;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.CalendarEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarEntryServiceImple extends AbstractSecuredService implements CalendarEntryService {

    private final CalendarEntryRepository calendarEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;

    @Override
    public CalendarEntryDto createEntry(CalendarEntryDto dto) {
        requireAccessToEmployee(dto.getEmployeeId());
        CalendarEntry entry = new CalendarEntry();
        fillEntry(entry, dto);
        return toDto(calendarEntryRepository.save(entry));
    }

    @Override
    public CalendarEntryDto getEntry(UUID id) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        requireAccessToEmployee(entry.getEmployee().getId());
        return toDto(entry);
    }

    @Override
    public List<CalendarEntryDto> getEntriesForEmployee(UUID employeeId) {
        requireAccessToEmployee(employeeId);
        return calendarEntryRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalendarEntryDto> getEntriesForManager(UUID managerId) {
        UUID currentManager = requireManagerAndGetId();
        if (!currentManager.equals(managerId)) {
            throw new CustomAccessDeniedException("Du darfst nur deine eigenen Mitarbeiter einsehen.");
        }
        return calendarEntryRepository.findByEmployeeManagerId(managerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalendarEntryDto> getEntriesByType(CalendarEntryType type) {
        if (!hasRole(UserRole.MANAGER)) {
            throw new CustomAccessDeniedException("Nur Manager duerfen nach Typ filtern.");
        }
        return calendarEntryRepository.findByType(type).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CalendarEntryDto updateEntry(UUID id, CalendarEntryDto dto) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        requireAccessToEmployee(entry.getEmployee().getId());
        requireAccessToEmployee(dto.getEmployeeId());
        fillEntry(entry, dto);
        return toDto(calendarEntryRepository.save(entry));
    }

    @Override
    public void deleteEntry(UUID id) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        requireAccessToEmployee(entry.getEmployee().getId());
        calendarEntryRepository.delete(entry);
    }

    @Override
    public List<CalendarEventDto> getEventsForCurrentEmployee() {
        UUID employeeId = getCurrentUserId();
        return calendarEntryRepository.findByEmployeeId(employeeId).stream()
                .map(this::toEventDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalendarEventDto> getEventsForCurrentManager() {
        UUID managerId = requireManagerAndGetId();
        return calendarEntryRepository.findByEmployeeManagerId(managerId).stream()
                .map(this::toEventDto)
                .collect(Collectors.toList());
    }

    private void fillEntry(CalendarEntry entry, CalendarEntryDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        entry.setEmployee(employee);

        if (dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            entry.setTask(task);
        } else {
            entry.setTask(null);
        }

        entry.setType(dto.getType());
        entry.setStart(dto.getStart());
        entry.setEnd(dto.getEnd());
    }

    private CalendarEntryDto toDto(CalendarEntry entry) {
        return new CalendarEntryDto(
                entry.getId(),
                entry.getEmployee() != null ? entry.getEmployee().getId() : null,
                entry.getTask() != null ? entry.getTask().getId() : null,
                entry.getType(),
                entry.getStart(),
                entry.getEnd()
        );
    }

    private CalendarEventDto toEventDto(CalendarEntry entry) {
        String employeeName = entry.getEmployee() != null
                ? entry.getEmployee().getFirstName() + " " + entry.getEmployee().getLastName()
                : null;

        AssignmentStatus status = entry.getTask() != null ? AssignmentStatus.ACCEPTED : null;

        return new CalendarEventDto(
                entry.getId(),
                entry.getTask() != null ? entry.getTask().getId() : null,
                entry.getEmployee() != null ? entry.getEmployee().getId() : null,
                employeeName,
                entry.getType(),
                entry.getStart(),
                entry.getEnd(),
                entry.getTask() != null ? entry.getTask().getLocation() : null,
                entry.getTask() != null ? entry.getTask().getCompany() : null,
                status
        );
    }

    private void requireAccessToEmployee(UUID employeeId) {
        UUID current = getCurrentUserId();
        if (current.equals(employeeId)) {
            return;
        }

        if (hasRole(UserRole.MANAGER)) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

            if (employee.getManager() == null || !current.equals(employee.getManager().getId())) {
                throw new CustomAccessDeniedException("Kein Zugriff auf diesen Mitarbeiter.");
            }
            return;
        }

        throw new CustomAccessDeniedException("Kein Zugriff auf diesen Mitarbeiter.");
    }
}
