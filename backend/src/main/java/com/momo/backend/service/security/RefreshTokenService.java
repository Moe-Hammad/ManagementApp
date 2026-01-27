package com.momo.backend.service.security;

import com.momo.backend.entity.RefreshToken;
import com.momo.backend.entity.User;
import com.momo.backend.repository.RefreshTokenRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final int RAW_TOKEN_BYTES = 64;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${JWT_REFRESH_TTL}")
    private long refreshTtlMs;

    @Value("${REFRESH_PEPPER}")
    private String pepper;

    @PostConstruct
    void init() {
        if (pepper == null || pepper.isBlank()) {
            throw new IllegalStateException("REFRESH_PEPPER is not set. Provide env or application.properties value.");
        }
    }

    @Transactional
    public String createToken(User user, String deviceId, String userAgent, String ipAddress) {
        Instant now = Instant.now();
        TokenPair tokenPair = generateUniqueToken();

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(tokenPair.hash());
        token.setCreatedAt(now);
        token.setExpiresAt(now.plusMillis(refreshTtlMs));
        token.setLastUsedAt(now);
        token.setDeviceId(deviceId);
        token.setUserAgent(userAgent);
        token.setIpAddress(ipAddress);

        refreshTokenRepository.save(token);
        return tokenPair.raw();
    }

    @Transactional
    public RotationResult rotate(String rawToken, String deviceId, String userAgent, String ipAddress) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token required");
        }

        Instant now = Instant.now();
        String hash = hashToken(rawToken);

        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (existing.getRevokedAt() != null) {
            revokeAllForUser(existing.getUser().getId(), now);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token reuse detected");
        }

        if (existing.getExpiresAt().isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        TokenPair tokenPair = generateUniqueToken();

        existing.setRevokedAt(now);
        existing.setLastUsedAt(now);
        existing.setReplacedByTokenHash(tokenPair.hash());
        refreshTokenRepository.save(existing);

        RefreshToken replacement = new RefreshToken();
        replacement.setUser(existing.getUser());
        replacement.setTokenHash(tokenPair.hash());
        replacement.setCreatedAt(now);
        replacement.setExpiresAt(now.plusMillis(refreshTtlMs));
        replacement.setLastUsedAt(now);
        replacement.setDeviceId(firstNonBlank(deviceId, existing.getDeviceId()));
        replacement.setUserAgent(firstNonBlank(userAgent, existing.getUserAgent()));
        replacement.setIpAddress(firstNonBlank(ipAddress, existing.getIpAddress()));

        refreshTokenRepository.save(replacement);
        return new RotationResult(tokenPair.raw(), existing.getUser());
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token required");
        }

        String hash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                Instant now = Instant.now();
                token.setRevokedAt(now);
                token.setLastUsedAt(now);
                refreshTokenRepository.save(token);
            }
        });
    }

    @Transactional
    public void revokeAllForUser(UUID userId, Instant now) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser_IdAndRevokedAtIsNull(userId);
        for (RefreshToken token : tokens) {
            token.setRevokedAt(now);
            token.setLastUsedAt(now);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    private TokenPair generateUniqueToken() {
        for (int i = 0; i < 5; i++) {
            String raw = generateToken();
            String hash = hashToken(raw);
            if (!refreshTokenRepository.existsByTokenHash(hash)) {
                return new TokenPair(raw, hash);
            }
        }
        throw new IllegalStateException("Failed to generate unique refresh token");
    }

    private String generateToken() {
        byte[] bytes = new byte[RAW_TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((pepper + token).getBytes(StandardCharsets.UTF_8));
            return toHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String firstNonBlank(String preferred, String fallback) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return fallback;
    }

    public record RotationResult(String refreshToken, User user) {}

    private record TokenPair(String raw, String hash) {}
}
