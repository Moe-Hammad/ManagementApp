package com.momo.backend.dto;

import com.momo.backend.entity.enums.CalendarEntryType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
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
