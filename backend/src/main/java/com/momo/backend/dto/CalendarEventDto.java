package com.momo.backend.dto;

import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.entity.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDto {
    private UUID id;
    private UUID taskId;
    private UUID employeeId;
    private String employeeName;
    private CalendarEntryType type;
    private LocalDateTime start;
    private LocalDateTime end;
    private String location;
    private String company;
    private AssignmentStatus assignmentStatus;
}
