package com.momo.backend.service.implementation;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LogoutRequest;
import com.momo.backend.dto.Login.RefreshRequest;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.Login.TokenResponse;
import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.*;
import com.momo.backend.mapper.UserMapper;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.interfaces.AuthService;
import com.momo.backend.service.interfaces.EmployeeService;
import com.momo.backend.service.interfaces.ManagerService;
import com.momo.backend.service.interfaces.UserService;
import com.momo.backend.service.security.JwtTokenProvider;
import com.momo.backend.service.security.RefreshTokenService;
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
    private final RefreshTokenService refreshTokenService;
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
    public TokenResponse login(LoginRequest request, String deviceId, String userAgent, String ipAddress) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return buildTokenResponse(user, deviceId, userAgent, ipAddress);
    }

    // =======================
    // REGISTER
    // =======================
    public TokenResponse register(RegisterRequest request, String deviceId, String userAgent, String ipAddress) {

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

        User user = userRepository.findById(created.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return buildTokenResponse(user, deviceId, userAgent, ipAddress);
    }

    // =======================
    // REFRESH
    // =======================
    public TokenResponse refresh(RefreshRequest request, String deviceId, String userAgent, String ipAddress) {
        if (request == null || request.refreshToken() == null || request.refreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token required");
        }

        RefreshTokenService.RotationResult result = refreshTokenService.rotate(
                request.refreshToken(),
                deviceId,
                userAgent,
                ipAddress
        );

        User user = result.user();
        String accessToken = buildAccessToken(user);
        return new TokenResponse(accessToken, result.refreshToken(), user.getId().toString(), user.getRole());
    }

    // =======================
    // LOGOUT
    // =======================
    public void logout(LogoutRequest request) {
        if (request == null || request.refreshToken() == null || request.refreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token required");
        }
        refreshTokenService.revoke(request.refreshToken());
    }

    // =======================
    // TOKEN BUILDER
    // =======================
    private TokenResponse buildTokenResponse(User user, String deviceId, String userAgent, String ipAddress) {
        String accessToken = buildAccessToken(user);
        String refreshToken = refreshTokenService.createToken(user, deviceId, userAgent, ipAddress);
        return new TokenResponse(accessToken, refreshToken, user.getId().toString(), user.getRole());
    }

    private String buildAccessToken(User user) {

        return tokenProvider.generateToken(
                user.getEmail(),
                Map.of("uid", user.getId().toString(), "role", user.getRole())
        );

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
