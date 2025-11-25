package com.momo.backend.service.implementation;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.*;
import com.momo.backend.mapper.UserMapper;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.interfaces.AuthService;
import com.momo.backend.service.interfaces.EmployeeService;
import com.momo.backend.service.interfaces.ManagerService;
import com.momo.backend.service.interfaces.UserService;
import com.momo.backend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImple implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final ManagerService managerService;
    private final EmployeeService employeeService;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    // =======================
    // Decode
    // =======================

    public LoginRequest decode(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Authorization header");
        }

        String base64Credentials = authHeader.substring("Basic ".length());
        String credentials = new String(Base64.getDecoder().decode(base64Credentials));

        String[] parts = credentials.split(":", 2);
        if (parts.length != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Basic Auth format");
        }

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(parts[0]);
        loginRequest.setPassword(parts[1]);
        return loginRequest;
    }

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

    @Override
    public UserDto getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        // principal = uid (aus JWT Filter)
        String uid = (String) auth.getPrincipal();

        UUID userId;
        try {
            userId = UUID.fromString(uid);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user id in token");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user instanceof Manager manager) {
            return userMapper.managerToUserDto(manager);
        } else if (user instanceof Employee employee) {
            return userMapper.employeeToUserDto(employee);
        }

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unknown user role");
    }


}
