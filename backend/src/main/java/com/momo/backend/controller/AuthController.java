package com.momo.backend.controller;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.UserDto;
import com.momo.backend.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Login und Registrierung")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "User Login",
            description = "Authentifiziert per Basic Auth, antwortet mit JWT für weitere Requests."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login erfolgreich",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Ungültige Zugangsdaten")
    })

    public ResponseEntity<LoginResponse> login(
            @RequestHeader(value = "Authorization", required = true) String authHeader) {

        LoginRequest request = authService.decode(authHeader);
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.token())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.AUTHORIZATION)
                .body(response);
    }


    @PostMapping("/register")
    @Operation(
            summary = "User Registrierung",
            description = "Legt einen neuen Manager oder Employee an und gibt direkt ein JWT zurück."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User erstellt",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-Mail schon vergeben"),
            @ApiResponse(responseCode = "400", description = "Ungültige Rolle oder fehlende Pflichtfelder")
    })
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.token())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.AUTHORIZATION)
                .body(response);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Gibt den eingeloggten User zurück",
            description = "Basierend auf dem JWT wird der vollständige User inkl. Role-Daten zurückgegeben."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User erfolgreich geladen"),
            @ApiResponse(responseCode = "401", description = "Nicht eingeloggt oder Token ungültig")
    })
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }



}
