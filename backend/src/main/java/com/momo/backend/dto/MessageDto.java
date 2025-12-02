package com.momo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private UUID id;
    private UUID chatId;
    private UUID senderId;
    private String senderRole;
    private String text;
    private LocalDateTime createdAt;
}
