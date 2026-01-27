package com.momo.backend.dto.Login;

import com.momo.backend.entity.enums.UserRole;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String id,
        UserRole userType
) {}
