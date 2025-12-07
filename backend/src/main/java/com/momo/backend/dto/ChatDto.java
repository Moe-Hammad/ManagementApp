package com.momo.backend.dto;

import com.momo.backend.entity.enums.ChatType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {
    private UUID id;
    private String name;
    private ChatType type;
    private UUID managerId;
    private UUID taskId;
    private Set<UUID> memberIds;
    private LocalDateTime createdAt;
}
