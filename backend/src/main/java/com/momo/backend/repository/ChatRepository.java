package com.momo.backend.repository;

import com.momo.backend.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, UUID> {
    Optional<Chat> findByTaskId(UUID taskId);
}
