package com.momo.backend.service.security;

import com.momo.backend.dto.BaseUserDto;
import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.entity.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;


@Service
public class LoginAndRegister {

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse buildResponse(BaseUserDto user) {

        UserRole role = user.getRole(); // kein instanceof nötig!

        String token = tokenProvider.generateToken(
                user.getEmail(),
                Map.of("uid", user.getId().toString(), "role", role)
        );

        return new LoginResponse(token, user.getId().toString(), role);
    }



    public void validateRegisterRequest(RegisterRequest request) {
        if (isBlank(request.getFirstName()) || isBlank(request.getLastName())
                || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name, last name, email and password are required");
        }
    }

    public void validateLoginRequest(LoginRequest request) {
        if (isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }
    }

    public boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

}
