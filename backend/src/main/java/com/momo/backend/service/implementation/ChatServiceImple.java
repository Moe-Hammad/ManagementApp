package com.momo.backend.service.implementation;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.MessageDto;
import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Message;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.ChatType;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.ChatMapper;
import com.momo.backend.repository.ChatRepository;
import com.momo.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImple implements com.momo.backend.service.interfaces.ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ChatMapper chatMapper;

    @Override
    public ChatDto createTaskGroup(Task task, Manager manager) {
        Chat chat = new Chat();
        chat.setType(ChatType.GROUP);
        chat.setTask(task);
        chat.setManagerId(manager.getId());
        chat.setName(task.getLocation() + " - " + task.getCompany());
        Set<UUID> members = new HashSet<>();
        members.add(manager.getId());
        chat.setMemberIds(members);
        chat.setCreatedAt(LocalDateTime.now());
        return chatMapper.toDto(chatRepository.save(chat));
    }

    @Override
    public ChatDto addMemberToTaskChat(UUID taskId, UUID memberId) {
        Chat chat = chatRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat for task not found"));
        chat.getMemberIds().add(memberId);
        return chatMapper.toDto(chatRepository.save(chat));
    }

    @Override
    public List<ChatDto> getChatsForUser(UUID userId) {
        return chatRepository.findAll().stream()
                .filter(c -> c.getMemberIds().contains(userId))
                .map(chatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDto> getMessages(UUID chatId) {
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId).stream()
                .map(chatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto sendMessage(UUID chatId, UUID senderId, String senderRole, String text) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
        if (!chat.getMemberIds().contains(senderId)) {
            throw new IllegalStateException("Sender is not part of this chat");
        }
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(senderId);
        message.setSenderRole(senderRole);
        message.setText(text);
        message.setCreatedAt(LocalDateTime.now());
        return chatMapper.toDto(messageRepository.save(message));
    }

    @Override
    public ChatDto createDirectChat(UUID managerId, UUID employeeId) {
        // simple direct chat: manager + employee
        Chat chat = new Chat();
        chat.setType(ChatType.DIRECT);
        chat.setManagerId(managerId);
        chat.setName("Direct Chat");
        Set<UUID> members = new HashSet<>();
        members.add(managerId);
        members.add(employeeId);
        chat.setMemberIds(members);
        chat.setCreatedAt(LocalDateTime.now());
        return chatMapper.toDto(chatRepository.save(chat));
    }
}
