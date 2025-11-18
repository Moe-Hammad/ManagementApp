package com.momo.backend.service.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwt;

    @BeforeEach
    void setUp() {
        jwt = new JwtTokenProvider();

        // Secret setzen (wir überschreiben das @Value-Feld)
        ReflectionTestUtils.setField(jwt, "secretEnv",
                "test-secret-key-for-jwt-tests-1234567890");
    }

    @Test
    void testGenerateToken() {
        UUID id = UUID.randomUUID();
        String token = jwt.generateToken(id, "MANAGER");

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void testValidateToken() {
        UUID id = UUID.randomUUID();
        String token = jwt.generateToken(id, "EMPLOYEE");

        assertTrue(jwt.validateToken(token));
    }

    @Test
    void testGetUserId() {
        UUID id = UUID.randomUUID();
        String token = jwt.generateToken(id, "EMPLOYEE");

        assertEquals(id, jwt.getUserId(token));
    }

    @Test
    void testGetUserType() {
        UUID id = UUID.randomUUID();
        String token = jwt.generateToken(id, "MANAGER");

        assertEquals("MANAGER", jwt.getUserType(token));
    }

    @Test
    void testInvalidToken() {
        String fakeToken = "invalid.token.value";

        assertFalse(jwt.validateToken(fakeToken));
    }
}
