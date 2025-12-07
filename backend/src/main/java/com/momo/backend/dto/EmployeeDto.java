package com.momo.backend.dto;

import com.momo.backend.entity.enums.UserRole;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto implements BaseUserDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role = UserRole.EMPLOYEE;
    private Double hourlyRate;
    private Boolean availability;
    private UUID managerId;
}

