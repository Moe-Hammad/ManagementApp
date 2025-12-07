package com.momo.backend.service.interfaces;

import com.momo.backend.dto.RequestDto;
import com.momo.backend.entity.enums.RequestStatus;

import java.util.List;
import java.util.UUID;

public interface RequestService {
    RequestDto createRequest(RequestDto dto);

    List<RequestDto> getRequestsForManager(UUID managerId);

    List<RequestDto> getRequestsForEmployee(UUID employeeId);

    RequestDto updateStatus(UUID requestId, RequestStatus status);

    RequestDto getById(UUID id);
}
