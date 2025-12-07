package com.momo.backend.dto;

import com.momo.backend.entity.enums.UserRole;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDto implements BaseUserDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role = UserRole.MANAGER;
    private List<EmployeeDto> employees;
}

