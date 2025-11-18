package com.momo.backend.service.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * @param id   Getter für ID, wird oft im Controller gebraucht ID des Users (UUID)
 * @param type User Typ: "MANAGER" oder "EMPLOYEE"
 */
public record SecurityUser(UUID id, String type) implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Wir benutzen den "type" als Authority
        // Beispiel: Manager hat Authority "MANAGER"
        return List.of(() -> type);
    }

    // Wir authentifizieren NIE mit Passwort (JWT-only)
    @Override
    public String getPassword() {
        return null;
    }

    // userid vom Konstructor
    @Override
    public String getUsername() {
        return id.toString();
    }

    // Jedes Konto wird als aktiv angesehen
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
