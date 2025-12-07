package com.momo.backend.repository;

import com.momo.backend.entity.CalendarEntry;
import com.momo.backend.entity.enums.CalendarEntryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CalendarEntryRepository extends JpaRepository<CalendarEntry, UUID> {

    List<CalendarEntry> findByEmployeeId(UUID employeeId);

    List<CalendarEntry> findByEmployeeManagerId(UUID managerId);

    List<CalendarEntry> findByType(CalendarEntryType type);

    List<CalendarEntry> findByTaskId(UUID taskId);

    java.util.Optional<CalendarEntry> findByTaskIdAndEmployeeId(UUID taskId, UUID employeeId);

}
