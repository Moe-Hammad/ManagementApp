package com.momo.backend.service;

import com.momo.backend.dto.RequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes request-related events to STOMP subscribers on /topic/requests.
 */
@Component
@RequiredArgsConstructor
public class RequestEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishCreated(RequestDto dto) {
        var event = new RequestEvent("request_created", dto);
        messagingTemplate.convertAndSendToUser(dto.getManagerId().toString(), "/queue/requests", event);
        messagingTemplate.convertAndSendToUser(dto.getEmployeeId().toString(), "/queue/requests", event);
    }

    public void publishUpdated(RequestDto dto) {
        var event = new RequestEvent("request_updated", dto);
        messagingTemplate.convertAndSendToUser(dto.getManagerId().toString(), "/queue/requests", event);
        messagingTemplate.convertAndSendToUser(dto.getEmployeeId().toString(), "/queue/requests", event);
    }

    public record RequestEvent(String type, RequestDto payload) {}
}
