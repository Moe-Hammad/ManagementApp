package com.momo.backend.service.interfaces;

import com.momo.backend.dto.CalendarEntryDto;
import com.momo.backend.dto.CalendarEventDto;
import com.momo.backend.entity.enums.CalendarEntryType;

import java.util.List;
import java.util.UUID;

public interface CalendarEntryService {
    CalendarEntryDto createEntry(CalendarEntryDto dto);
    CalendarEntryDto getEntry(UUID id);
    List<CalendarEntryDto> getEntriesForEmployee(UUID employeeId);
    List<CalendarEntryDto> getEntriesForManager(UUID managerId);
    List<CalendarEntryDto> getEntriesByType(CalendarEntryType type);
    CalendarEntryDto updateEntry(UUID id, CalendarEntryDto dto);
    void deleteEntry(UUID id);

    List<CalendarEventDto> getEventsForCurrentEmployee();

    List<CalendarEventDto> getEventsForCurrentManager();
}
