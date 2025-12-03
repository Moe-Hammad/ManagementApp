package com.momo.backend.service.base;

import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.exception.CustomAccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * AbstractSecuredService
 * ---------------------------------------------------------
 * Basisklasse für Services, die auf den aktuell eingeloggten
 * User und seine Rollen zugreifen müssen.
 *
 * Hier liegen alle Security-Hilfsmethoden, die vorher z.B.
 * direkt im ChatServiceImple standen.
 *
 * Andere Services (Requests, Tasks, etc.) können später
 * einfach "extends AbstractSecuredService" machen und diese
 * Methoden mitbenutzen.
 */
public abstract class AbstractSecuredService {

    /**
     * Liefert die ID des aktuell eingeloggten Users aus dem
     * SecurityContext.
     *
     * Wichtig:
     * - Implementierung hier sollte 1:1 so sein wie bisher
     *   in deinem ChatServiceImple.getCurrentUserId().
     */
    protected UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new CustomAccessDeniedException("Not authenticated");
        }
        // Falls du bisher etwas anderes gemacht hast (z.B. Email + Repository),
        // dann bitte die Logik aus ChatServiceImple hierher KOPIEREN.
        return UUID.fromString(auth.getName());
    }

    /**
     * Prüft, ob der aktuelle User eine bestimmte Rolle hat.
     */
    protected boolean hasRole(UserRole role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role.name()));
    }

    /**
     * Wirft eine Exception, wenn der User die Rolle nicht hat.
     */
    protected void requireRole(UserRole role) {
        if (!hasRole(role)) {
            throw new CustomAccessDeniedException("Required role: " + role);
        }
    }

    /**
     * Convenience-Methode speziell für Manager.
     */
    protected void requireManager() {
        requireRole(UserRole.MANAGER);
    }

    protected UUID requireManagerAndGetId() {
        UUID id = getCurrentUserId();
        requireManager(); // wirft 403 wenn keine Manager-Rolle vorhanden
        return id;
    }

}
