package com.momo.backend.controller;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.CreateDirectChatRequest;
import com.momo.backend.dto.CreateGroupChatRequest;
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
    @Operation(summary = "Alle Chats des eingeloggten Users")
    public ResponseEntity<List<ChatDto>> getChats() {
        return ResponseEntity.ok(chatService.getChatsForCurrentUser());
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Nachrichten eines Chats abrufen")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getMessages(chatId));
    }

    @PostMapping("/direct")
    @Operation(summary = "Direkten Chat anlegen (Manager/Employee)")
    public ResponseEntity<ChatDto> createDirect(@RequestBody CreateDirectChatRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.createDirectChat(req.getManagerId(), req.getEmployeeId()));
    }

    @PostMapping("/group")
    @Operation(summary = "Gruppenchat anlegen")
    public ResponseEntity<ChatDto> createGroup(@RequestBody CreateGroupChatRequest req) {
        ChatDto chatDto = new ChatDto();
        chatDto.setName(req.getName());
        chatDto.setMemberIds(req.getMemberIds());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.createGroupChat(chatDto, req.getTaskId()));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Nachricht in Chat senden")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable UUID chatId,
            @RequestBody String text
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendMessage(chatId, text));
    }
}
