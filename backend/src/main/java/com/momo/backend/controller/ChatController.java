package com.momo.backend.controller;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.MessageDto;
import com.momo.backend.service.interfaces.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@Tag(name = "Chats", description = "Chats und Nachrichten")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    @Operation(summary = "Alle Chats eines Users")
    public ResponseEntity<List<ChatDto>> getChats(@RequestParam UUID userId) {
        return ResponseEntity.ok(chatService.getChatsForUser(userId));
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Nachrichten eines Chats abrufen")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getMessages(chatId));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Nachricht in Chat senden")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable UUID chatId,
            @RequestParam UUID senderId,
            @RequestParam String senderRole,
            @RequestBody String text
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendMessage(chatId, senderId, senderRole, text));
    }
}
