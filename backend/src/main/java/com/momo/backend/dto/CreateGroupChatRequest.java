package com.momo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupChatRequest {
    private String name;
    private UUID taskId;
    private Set<UUID> memberIds;
}
