package com.momo.backend.dto;


import com.momo.backend.entity.enums.UserRole;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserDto {
    private UUID id;
    private String email;
    private UserRole role;

    private String firstName;
    private String lastName;

    // Employee specific
    private Double hourlyRate;
    private Boolean availability;
    private UUID managerId;

    // Manager specific
    private List<EmployeeDto> employees;
}

