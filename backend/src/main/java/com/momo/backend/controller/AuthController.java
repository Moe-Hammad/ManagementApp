package com.momo.backend.controller;

import com.momo.backend.dto.Login.LoginRequest;
import com.momo.backend.dto.Login.LogoutRequest;
import com.momo.backend.dto.Login.RefreshRequest;
import com.momo.backend.dto.Login.RegisterRequest;
import com.momo.backend.dto.Login.TokenResponse;
import com.momo.backend.dto.UserDto;
import com.momo.backend.service.interfaces.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
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
@Tag(name = "Auth", description = "Login, Registrierung, Refresh und Logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "User Login",
            description = "Authentifiziert per Basic Auth (email:passwort) und startet eine Session. Gibt Access-Token fuer API-Aufrufe und Refresh-Token fuer spaeteres Erneuern zurueck."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login erfolgreich",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Ungültige Zugangsdaten")
    })

    public ResponseEntity<TokenResponse> login(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            HttpServletRequest httpRequest) {

        LoginRequest request = authService.decode(authHeader);
        TokenResponse response = authService.login(
                request,
                deviceId,
                httpRequest.getHeader(HttpHeaders.USER_AGENT),
                resolveIp(httpRequest)
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.accessToken())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.AUTHORIZATION)
                .body(response);
    }


    @PostMapping("/register")
    @Operation(
            summary = "User Registrierung",
            description = "Legt einen neuen Manager oder Employee an und startet sofort eine Session. Gibt Access-Token fuer API-Aufrufe und Refresh-Token fuer spaeteres Erneuern zurueck."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User erstellt",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-Mail schon vergeben"),
            @ApiResponse(responseCode = "400", description = "Ungültige Rolle oder fehlende Pflichtfelder")
    })
    public ResponseEntity<TokenResponse> register(
            @RequestBody RegisterRequest request,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            HttpServletRequest httpRequest) {
        TokenResponse response = authService.register(
                request,
                deviceId,
                httpRequest.getHeader(HttpHeaders.USER_AGENT),
                resolveIp(httpRequest)
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.accessToken())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.AUTHORIZATION)
                .body(response);
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Refresh access token",
            description = "Validiert das Refresh-Token, rotiert es und liefert ein neues Token-Paar. Das alte Refresh-Token wird invalidiert; bei Reuse werden alle Tokens des Users widerrufen."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    public ResponseEntity<TokenResponse> refresh(
            @RequestBody RefreshRequest request,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            HttpServletRequest httpRequest) {
        TokenResponse response = authService.refresh(
                request,
                deviceId,
                httpRequest.getHeader(HttpHeaders.USER_AGENT),
                resolveIp(httpRequest)
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.accessToken())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.AUTHORIZATION)
                .body(response);
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Logout",
            description = "Invalidiert das Refresh-Token der Session, damit keine weitere Erneuerung moeglich ist. Das Access-Token laeuft regulaer aus."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logout successful"),
            @ApiResponse(responseCode = "400", description = "Missing refresh token")
    })
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(
            summary = "Eingeloggten User abrufen",
            description = "Ermittelt den eingeloggten User aus dem JWT und liefert Profil- und Rolleninfos fuer Bootstrap oder Profilansichten."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User erfolgreich geladen"),
            @ApiResponse(responseCode = "401", description = "Nicht eingeloggt oder Token ungültig")
    })
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }


}
