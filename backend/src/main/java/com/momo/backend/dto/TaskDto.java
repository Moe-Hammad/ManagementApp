package com.momo.backend.dto;

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
public class TaskDto {
    private UUID id;
    private UUID managerId;
    private String location;
    private int requiredEmployees;
    private LocalDateTime start;
    private LocalDateTime end;
    private LocalDateTime responseDeadline;
}
