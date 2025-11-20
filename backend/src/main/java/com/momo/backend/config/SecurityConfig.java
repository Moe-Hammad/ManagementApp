package com.momo.backend.config;

import com.momo.backend.service.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@Profile("!test")
@EnableWebSecurity
public class SecurityConfig {

    // Unser eigener Filter, der JWT Tokens prüft
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Wir deaktivieren CSRF komplett — sinnvoll bei REST + JWT
                .csrf(AbstractHttpConfigurer::disable)

                // Regeln, welche Endpoints geschützt oder offen sind
                .authorizeHttpRequests(auth -> auth

                        // Login darf ohne Auth erreicht werden
                        .requestMatchers("/api/auth/login").permitAll()

                        // ALLE anderen Endpunkte brauchen ein gültiges JWT
                        .anyRequest().authenticated()
                )

                // JWT Filter wird VOR UsernamePasswordAuthenticationFilter durchgeführt
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
