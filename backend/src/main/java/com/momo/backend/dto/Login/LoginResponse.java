package com.momo.backend.dto.Login;

public record LoginResponse(
        String token,
        String id,
        String userType
) {}
