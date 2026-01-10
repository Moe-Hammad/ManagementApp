package com.momo.backend.service.interfaces;


import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LogoutRequest;
import com.momo.backend.dto.Login.RefreshRequest;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.Login.TokenResponse;
import com.momo.backend.dto.UserDto;

public interface AuthService {
    TokenResponse login(LoginRequest request, String deviceId, String userAgent, String ipAddress);
    TokenResponse register(RegisterRequest request, String deviceId, String userAgent, String ipAddress);
    TokenResponse refresh(RefreshRequest request, String deviceId, String userAgent, String ipAddress);
    void logout(LogoutRequest request);
    LoginRequest decode (String authHeader);
    UserDto getCurrentUser();
}
