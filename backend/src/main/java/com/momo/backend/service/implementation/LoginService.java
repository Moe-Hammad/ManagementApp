package com.momo.backend.service.implementation;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.momo.backend.util.UserFunctions;

import java.util.Base64;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private UserFunctions util;

    public LoginService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse loginWithBasic(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        // "Basic dXNlckBtYWlsLmNvbTpwYXNzMTIz" -> Base64 decode
        String base64Credentials = authHeader.substring("Basic ".length()).trim();
        String credentials = new String(Base64.getDecoder().decode(base64Credentials));

        // split email:password
        String[] parts = credentials.split(":");
        if (parts.length != 2) {
            throw new RuntimeException("Invalid basic auth format");
        }

        String email = parts[0];
        String password = parts[1];

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = tokenProvider.generateToken(user.getId(), util.getUserType(user));

        return new LoginResponse(token, user.getId().toString(), util.getUserType(user));
    }


//    public LoginResponse login(LoginRequest request) {
//
//        String userType = null;
//        var user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("Error: Invalid Login"));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Error: Invalid Login");
//        }
//
//        userType = util.getUserType(user);
//        String token = tokenProvider.generateToken(user.getId(), userType);
//
//        return new LoginResponse(token, user.getId().toString() ,userType);
//    }


}
