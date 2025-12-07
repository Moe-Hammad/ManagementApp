package com.momo.backend.dto;

import com.momo.backend.entity.enums.UserRole;

import java.util.UUID;

public interface BaseUserDto {
    String getEmail();
    UUID getId();
    UserRole getRole();
}
