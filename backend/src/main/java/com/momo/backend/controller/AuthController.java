package com.momo.backend.controller;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody(required = false) LoginRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Fallback for tests or if Basic auth header was not processed
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            if (request == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing credentials");
            }
            validateLoginRequest(request);
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );
            } catch (AuthenticationException ex) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        return ResponseEntity.ok(buildResponse(user));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        validateRegisterRequest(request);

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }

        String targetRole = normalizeRole(request.getRole());

        User createdUser;
        if ("MANAGER".equals(targetRole)) {
            Manager manager = new Manager();
            manager.setFirstName(request.getFirstName());
            manager.setLastName(request.getLastName());
            manager.setEmail(request.getEmail());
            manager.setPassword(passwordEncoder.encode(request.getPassword()));
            createdUser = managerRepository.save(manager);
        } else if ("EMPLOYEE".equals(targetRole)) {
            Employee employee = new Employee();
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setEmail(request.getEmail());
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
            employee.setHourlyRate(request.getHourlyRate());
            createdUser = employeeRepository.save(employee);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role: " + request.getRole());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(createdUser));
    }

    private LoginResponse buildResponse(User user) {
        String role = (user instanceof Manager) ? "MANAGER" :
                (user instanceof Employee) ? "EMPLOYEE" : "USER";
        String token = tokenProvider.generateToken(
                user.getEmail(),
                Map.of("uid", user.getId().toString(), "role", role)
        );
        return new LoginResponse(token, user.getId().toString(), role);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "MANAGER";
        }
        return role.trim().toUpperCase();
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (isBlank(request.getFirstName()) || isBlank(request.getLastName())
                || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name, last name, email and password are required");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
