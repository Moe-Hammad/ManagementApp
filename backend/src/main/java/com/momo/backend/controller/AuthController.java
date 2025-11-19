package com.momo.backend.controller;


import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.service.implementation.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestHeader("Authorization") String authHeader
    ) {
        LoginResponse response = loginService.loginWithBasic(authHeader);
        return ResponseEntity.ok(response);
    }
}

