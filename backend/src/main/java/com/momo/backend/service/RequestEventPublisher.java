package com.momo.backend.service;

import com.momo.backend.dto.RequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RequestEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishCreated(RequestDto dto) {
        messagingTemplate.convertAndSend("/topic/requests", new RequestEvent("request_created", dto));
    }

    public void publishUpdated(RequestDto dto) {
        messagingTemplate.convertAndSend("/topic/requests", new RequestEvent("request_updated", dto));
    }

    public record RequestEvent(String type, RequestDto payload) {}
}
