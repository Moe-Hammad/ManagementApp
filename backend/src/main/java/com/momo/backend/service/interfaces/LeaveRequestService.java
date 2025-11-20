package com.momo.backend.service.interfaces;

import com.momo.backend.dto.LeaveRequestDto;
import com.momo.backend.entity.enums.LeaveStatus;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestService {
    LeaveRequestDto createLeaveRequest(LeaveRequestDto dto);
    LeaveRequestDto getLeaveRequest(UUID id);
    List<LeaveRequestDto> getLeaveRequestsForEmployee(UUID employeeId);
    List<LeaveRequestDto> getLeaveRequestsForManager(UUID managerId);
    List<LeaveRequestDto> getLeaveRequestsByStatus(LeaveStatus status);
    LeaveRequestDto updateStatus(UUID id, LeaveStatus status, UUID decidedById);
    void deleteLeaveRequest(UUID id);
}
