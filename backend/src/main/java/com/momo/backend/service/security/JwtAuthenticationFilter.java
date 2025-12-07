package com.momo.backend.service.security;

import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = trimBearer(request);

        if (token != null &&
                tokenProvider.validateToken(token) &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // Claims lesen
            var claims = tokenProvider.parseClaims(token);

            String uid = claims.get("uid", String.class);
            String roleStr = claims.get("role", String.class);

            // Enum-Rolle aus String erzeugen
            UserRole role = UserRole.valueOf(roleStr);

            // Authorities erzeugen
            List<GrantedAuthority> authorities = mapRoleToAuthorities(role);

            // Authentication bauen
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            uid,        // principal = userId
                            token,      // credentials = JWT
                            authorities // ROLE_MANAGER / ROLE_EMPLOYEE
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    // Rolle → Spring Authorities
    public List<GrantedAuthority> mapRoleToAuthorities(UserRole role) {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    private String trimBearer(HttpServletRequest request) {
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
