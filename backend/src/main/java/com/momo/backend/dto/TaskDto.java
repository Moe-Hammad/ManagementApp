package com.momo.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private UUID id;
    private UUID managerId;
    private String location;
    private String company;
    private int requiredEmployees;
    private LocalDateTime start;
    private LocalDateTime end;
    private LocalDateTime responseDeadline;
}
