package com.momo.backend.service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    // Wird aus application.properties oder .env geladen
    @Value("${JWT_SECRET}")
    private String secretEnv;

    // 24h gültig
    private static final long EXPIRATION = 24 * 60 * 60 * 1000;

    // Secret wird in ein HMAC-SHA Key verwandelt
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretEnv.getBytes(StandardCharsets.UTF_8));
    }

    // ------------------------------
    // JWT TOKEN ERSTELLEN
    // ------------------------------
    public String generateToken(UUID userId, String userType) {
        return Jwts.builder()
                // Wir schreiben unsere Daten in den Token
                .claim("id", userId.toString())
                .claim("type", userType)

                // Standard Claims
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))

                // Signieren mit HMAC256
                .signWith(getSigningKey())

                // JWT als String zurückgeben
                .compact();
    }

    // ------------------------------
    // TOKEN VALIDIEREN
    // ------------------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;

        } catch (Exception ex) {
            return false;
        }
    }

    // ------------------------------
    // USER-ID AUS TOKEN LESEN
    // ------------------------------
    public UUID getUserId(String token) {
        var claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return UUID.fromString(claims.get("id", String.class));
    }

    // ------------------------------
    // USER-TYPE ("MANAGER"/"EMPLOYEE") LESEN
    // ------------------------------
    public String getUserType(String token) {
        var claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("type", String.class);
    }
}
