package com.momo.backend.dto;


import com.momo.backend.entity.enums.UserRole;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements BaseUserDto {
    private UUID id;
    private String email;
    private UserRole role;  // "MANAGER" oder "EMPLOYEE"
}
