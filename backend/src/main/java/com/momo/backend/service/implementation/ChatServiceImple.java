package com.momo.backend.service.implementation;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.MessageDto;
import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Message;
import com.momo.backend.entity.Task;
import com.momo.backend.entity.enums.ChatType;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.ChatMapper;
import com.momo.backend.repository.ChatRepository;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.MessageRepository;
import com.momo.backend.repository.TaskRepository;
import com.momo.backend.service.base.AbstractSecuredService;
import com.momo.backend.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImple extends AbstractSecuredService implements ChatService {


    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerRepository managerRepository;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskRepository taskRepository;

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
    public ChatDto createGroupChat(ChatDto dto, UUID taskId) {
        UUID managerId = requireManagerAndGetId();
        Chat chat = new Chat();
        chat.setType(ChatType.GROUP);
        chat.setManagerId(managerId);
        chat.setName(dto.getName());
        if (taskId != null) {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            if (task.getManager() != null && !task.getManager().getId().equals(managerId)) {
                throw new AccessDeniedException("Manager does not own this task");
            }
            chat.setTask(task);
            if (chat.getName() == null || chat.getName().isBlank()) {
                chat.setName(task.getLocation() + " - " + task.getCompany());
            }
        }
        chat.setMemberIds(dto.getMemberIds() != null ? new HashSet<>(dto.getMemberIds()) : new HashSet<>());
        chat.getMemberIds().add(managerId);
        chat.setCreatedAt(LocalDateTime.now());
        return chatMapper.toDto(chatRepository.save(chat));
    }

    @Override
    public List<ChatDto> getChatsForCurrentUser() {
        UUID userId = getCurrentUserId();
        return chatRepository.findAll().stream()
                .filter(c -> c.getMemberIds().contains(userId))
                .map(chatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDto> getMessages(UUID chatId) {
        UUID requesterId = getCurrentUserId();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
        assertChatMember(chat, requesterId);
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId).stream()
                .map(chatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto sendMessage(UUID chatId, String text) {
        UUID senderId = getCurrentUserId();
        String senderRole = resolveCurrentRole();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
        assertChatMember(chat, senderId);
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text must not be empty");
        }
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(senderId);
        message.setSenderRole(senderRole);
        message.setText(text);
        message.setCreatedAt(LocalDateTime.now());
        MessageDto dto = chatMapper.toDto(messageRepository.save(message));
        chat.getMemberIds().forEach(member -> convertAndSendToUser(member, dto));
        return dto;
    }

    private void convertAndSendToUser(UUID userId, MessageDto dto) {
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/messages", dto);
    }

    @Override
    public ChatDto createDirectChat(UUID managerId, UUID employeeId) {
        UUID caller = getCurrentUserId();
        boolean callerIsManager = hasRole(UserRole.MANAGER);
        boolean callerIsEmployee = hasRole(UserRole.EMPLOYEE);

        if (!caller.equals(managerId) && !caller.equals(employeeId)) {
            throw new AccessDeniedException("Caller must be part of the direct chat");
        }
        if (caller.equals(managerId) && !callerIsManager) {
            throw new AccessDeniedException("Only managers can create manager-employee chats");
        }
        if (caller.equals(employeeId) && !callerIsEmployee) {
            throw new AccessDeniedException("Only employees can create manager-employee chats");
        }

        managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        var employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (employee.getManager() == null || !managerId.equals(employee.getManager().getId())) {
            throw new AccessDeniedException("Manager and employee are not linked");
        }

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



    private String resolveCurrentRole() {
        if (hasRole(UserRole.MANAGER)) {
            return UserRole.MANAGER.name();
        }
        if (hasRole(UserRole.EMPLOYEE)) {
            return UserRole.EMPLOYEE.name();
        }
        throw new AccessDeniedException("Unknown role");
    }



    private void assertChatMember(Chat chat, UUID userId) {
        if (!chat.getMemberIds().contains(userId)) {
            throw new AccessDeniedException("User is not part of this chat");
        }
    }
}
