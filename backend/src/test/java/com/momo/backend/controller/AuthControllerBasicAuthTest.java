package com.momo.backend.controller;

import com.momo.backend.Security.TestSecurityConfig;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestSecurityConfig.class, AuthControllerBasicAuthTest.PasswordEncoderTestConfig.class})
class AuthControllerBasicAuthTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/auth/login authenticates a seeded manager via Basic Auth")
    void loginWithValidBasicCredentialsReturnsToken() throws Exception {
        String email = "basic.manager@mail.com";
        String rawPassword = "test-password-123";
        persistManager(email, rawPassword);

        mockMvc.perform(
                        MockMvcRequestBuilders.post("/api/auth/login")
                                .header("Authorization", basic(email, rawPassword))
                )
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.userType").value("MANAGER"));
    }

    @Test
    @DisplayName("POST /api/auth/login rejects requests with invalid Basic credentials")
    void loginWithInvalidPasswordFails() throws Exception {
        String email = "basic.manager@mail.com";
        String rawPassword = "test-password-123";
        persistManager(email, rawPassword);

        mockMvc.perform(
                        MockMvcRequestBuilders.post("/api/auth/login")
                                .header("Authorization", basic(email, "wrong-password"))
                )
                .andExpect(status().is5xxServerError());
    }

    private void persistManager(String email, String rawPassword) {
        Manager manager = new Manager();
        manager.setFirstName("Basic");
        manager.setLastName("Manager");
        manager.setEmail(email);
        manager.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(manager);
    }

    private String basic(String username, String password) {
        String credentials = username + ":" + password;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    @TestConfiguration
    static class PasswordEncoderTestConfig {
        @Bean
        @Primary
        PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }
}
