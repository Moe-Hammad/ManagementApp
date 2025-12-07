package com.momo.backend.service.interfaces;


import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.UserDto;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
    LoginRequest decode (String authHeader);
    UserDto getCurrentUser();
}
