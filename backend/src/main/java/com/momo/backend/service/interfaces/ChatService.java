package com.momo.backend.service.interfaces;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.MessageDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.ChatType;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    ChatDto createTaskGroup(Task task, Manager manager);
    ChatDto addMemberToTaskChat(UUID taskId, UUID memberId);
    List<ChatDto> getChatsForUser(UUID userId);
    List<MessageDto> getMessages(UUID chatId);
    MessageDto sendMessage(UUID chatId, UUID senderId, String senderRole, String text);
    ChatDto createDirectChat(UUID managerId, UUID employeeId);
}
