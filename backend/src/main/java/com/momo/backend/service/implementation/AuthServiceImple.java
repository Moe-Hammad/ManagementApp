package com.momo.backend.service.implementation;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.UserDto;
import com.momo.backend.service.interfaces.AuthService;
import com.momo.backend.service.interfaces.EmployeeService;
import com.momo.backend.service.interfaces.ManagerService;
import com.momo.backend.service.interfaces.UserService;
import com.momo.backend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImple implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final ManagerService managerService;
    private final EmployeeService employeeService;
    private final JwtTokenProvider tokenProvider;

    // =======================
    // LOGIN
    // =======================
    public LoginResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        if(!userService.emailExists(request.getEmail())){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not Found.");
        }
        UserDto userDto = userService.loadUserDtoByEmail(request.getEmail());

        return buildResponse(userDto);
    }

    // =======================
    // REGISTER
    // =======================
    public LoginResponse register(RegisterRequest request) {

        if (userService.emailExists(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        String role = normalizeRole(request.getRole());

        UserDto created;

        if ("MANAGER".equals(role)) {
            created = managerService.registerManager(request);

        } else {
            created = employeeService.registerEmployee(request);
        }

        return buildResponse(created);
    }

    // =======================
    // TOKEN BUILDER
    // =======================
    public LoginResponse buildResponse(UserDto user) {

        String token = tokenProvider.generateToken(
                user.getEmail(),
                Map.of("uid", user.getId().toString(), "role", user.getRole())
        );

        return new LoginResponse(token, user.getId().toString(), user.getRole());
    }

    // =======================
    // Helpers
    // =======================
    private String normalizeRole(String role) {
        if (role == null) return "EMPLOYEE";
        if (role.equalsIgnoreCase("manager")) return "MANAGER";
        return "EMPLOYEE";
    }
}
