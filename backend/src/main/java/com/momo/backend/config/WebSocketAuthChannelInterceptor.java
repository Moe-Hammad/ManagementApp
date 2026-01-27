package com.momo.backend.config;

import com.momo.backend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Validates JWT on STOMP CONNECT and attaches authentication to the WebSocket session.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("WS CONNECT frame received, session={}, headers={}", accessor.getSessionId(), accessor.toNativeHeaderMap());
            String token = resolveToken(accessor);
            if (token == null || !jwtTokenProvider.validateToken(token)) {
                log.warn("WS CONNECT rejected: missing or invalid JWT, session={}", accessor.getSessionId());
                throw new MessageDeliveryException("Missing or invalid JWT for WebSocket CONNECT");
            }

            var claims = jwtTokenProvider.parseClaims(token);
            String uid = claims.get("uid", String.class);
            if (uid == null) {
                uid = claims.get("id", String.class); // fallback: legacy claim
            }
            if (uid == null) {
                uid = claims.getSubject(); // fallback: sub, if it already is the UUID/uid
            }
            String role = claims.get("role", String.class);
            if (uid == null || role == null) {
                throw new MessageDeliveryException("Invalid JWT claims: missing uid or role");
            }

            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(uid, null, authorities);
            accessor.setUser(authentication);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            // Log the principal used for STOMP user destinations
            log.info("WS CONNECT principal={} role={}", uid, role);
        }
        return message;
    }

    // Resolve Authorization header (Bearer <token>) from CONNECT frame
    private String resolveToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader(HttpHeaders.AUTHORIZATION);
        if ((authHeaders == null || authHeaders.isEmpty())) {
            authHeaders = accessor.getNativeHeader("authorization"); // tolerate lowercase header
        }
        String header = (authHeaders != null && !authHeaders.isEmpty()) ? authHeaders.get(0) : null;
        if (header == null) {
            return null;
        }
        String normalized = header.trim();
        // Allow "Bearer <token>" and "bearer <token>" (case-insensitive)
        if (normalized.toLowerCase().startsWith("bearer ")) {
            return normalized.substring(7).trim();
        }
        return null;
    }
}
