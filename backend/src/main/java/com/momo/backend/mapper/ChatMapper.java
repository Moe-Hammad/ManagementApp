package com.momo.backend.mapper;

import com.momo.backend.dto.ChatDto;
import com.momo.backend.dto.MessageDto;
import com.momo.backend.entity.Chat;
import com.momo.backend.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class ChatMapper {

    public ChatDto toDto(Chat chat) {
        return new ChatDto(
                chat.getId(),
                chat.getName(),
                chat.getType(),
                chat.getManagerId(),
                chat.getTask() != null ? chat.getTask().getId() : null,
                chat.getMemberIds(),
                chat.getCreatedAt()
        );
    }

    public MessageDto toDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getChat() != null ? message.getChat().getId() : null,
                message.getSenderId(),
                message.getSenderRole(),
                message.getText(),
                message.getCreatedAt()
        );
    }
}
