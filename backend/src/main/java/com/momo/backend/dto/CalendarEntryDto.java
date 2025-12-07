package com.momo.backend.dto;

import com.momo.backend.entity.enums.CalendarEntryType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEntryDto {
    private UUID id;
    private UUID employeeId;
    private UUID taskId;
    private CalendarEntryType type;
    private LocalDateTime start;
    private LocalDateTime end;
}
