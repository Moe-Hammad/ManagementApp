package com.momo.backend.service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Token Provider: validieren, Claims lesen, etc.
    private final JwtTokenProvider tokenProvider;

    public JwtAuthFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("URI: " + request.getRequestURI());
        System.out.println("ServletPath: " + request.getServletPath());
        System.out.println("ContextPath: " + request.getContextPath());


        if (request.getServletPath().equals("/api/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Header lesen — Standard: "Authorization: Bearer <token>"
        String header = request.getHeader("Authorization");

        // Token existiert und beginnt richtig
        if (header != null && header.startsWith("Bearer ")) {

            // Reinen Token extrahieren (ohne "Bearer ")
            String token = header.substring(7);

            // Ist Token gültig?
            if (tokenProvider.validateToken(token)) {

                // Claims aus dem Token ziehen
                UUID id = tokenProvider.getUserId(token);
                String type = tokenProvider.getUserType(token);

                // Unser CustomUser-Objekt
                SecurityUser user = new SecurityUser(id, type);

                // Authentication Objekt erstellen
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user,            // Principal
                        null,            // Credentials (nicht nötig)
                        user.getAuthorities()   // "type" als Authority
                );

                // Infos aus der Request anhängen
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Benutzer als "eingeloggt" im SecurityContext speichern
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Ganz wichtig: Anfrage weiterleiten
        filterChain.doFilter(request, response);
    }
}
