package com.momo.backend.repository;

import com.momo.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    boolean existsByTokenHash(String tokenHash);
    List<RefreshToken> findAllByUser_IdAndRevokedAtIsNull(UUID userId);
}
