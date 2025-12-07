package com.momo.backend.dto.Login;

import com.momo.backend.entity.enums.UserRole;

public record LoginResponse(
        String token,
        String id,
        UserRole userType
) {}
