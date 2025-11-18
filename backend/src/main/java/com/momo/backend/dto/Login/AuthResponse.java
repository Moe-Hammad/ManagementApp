package com.momo.backend.dto.Login;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String role; // "MANAGER" oder "EMPLOYEE"
}
