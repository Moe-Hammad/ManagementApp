package com.momo.backend.service.implementation;

import com.momo.backend.dto.CalendarEntryDto;
import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.repository.CalendarEntryRepository;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.interfaces.CalendarEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarEntryServiceImple implements CalendarEntryService {

    private final CalendarEntryRepository calendarEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;

    @Override
    public CalendarEntryDto createEntry(CalendarEntryDto dto) {
        CalendarEntry entry = new CalendarEntry();
        fillEntry(entry, dto);
        return toDto(calendarEntryRepository.save(entry));
    }

    @Override
    public CalendarEntryDto getEntry(UUID id) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        return toDto(entry);
    }

    @Override
    public List<CalendarEntryDto> getEntriesForEmployee(UUID employeeId) {
        return calendarEntryRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalendarEntryDto> getEntriesForManager(UUID managerId) {
        return calendarEntryRepository.findByEmployeeManagerId(managerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalendarEntryDto> getEntriesByType(CalendarEntryType type) {
        return calendarEntryRepository.findByType(type).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CalendarEntryDto updateEntry(UUID id, CalendarEntryDto dto) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        fillEntry(entry, dto);
        return toDto(calendarEntryRepository.save(entry));
    }

    @Override
    public void deleteEntry(UUID id) {
        CalendarEntry entry = calendarEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar entry not found"));
        calendarEntryRepository.delete(entry);
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
}
