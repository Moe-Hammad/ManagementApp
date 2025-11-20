package com.momo.backend.service.implementation;

import com.momo.backend.dto.LeaveRequestDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.LeaveRequest;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.enums.LeaveStatus;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.LeaveRequestRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.interfaces.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImple implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerRepository managerRepository;

    @Override
    public LeaveRequestDto createLeaveRequest(LeaveRequestDto dto) {
        LeaveRequest leaveRequest = new LeaveRequest();
        fillLeaveRequest(leaveRequest, dto);
        leaveRequest.setStatus(dto.getStatus() != null ? dto.getStatus() : LeaveStatus.PENDING);
        leaveRequest.setCreatedAt(leaveRequest.getCreatedAt() != null ? leaveRequest.getCreatedAt() : LocalDateTime.now());
        return toDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    public LeaveRequestDto getLeaveRequest(UUID id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        return toDto(leaveRequest);
    }

    @Override
    public List<LeaveRequestDto> getLeaveRequestsForEmployee(UUID employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDto> getLeaveRequestsForManager(UUID managerId) {
        return leaveRequestRepository.findByEmployeeManagerId(managerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDto> getLeaveRequestsByStatus(LeaveStatus status) {
        return leaveRequestRepository.findByStatus(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto updateStatus(UUID id, LeaveStatus status, UUID decidedById) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        leaveRequest.setStatus(status);
        leaveRequest.setDecidedAt(LocalDateTime.now());

        if (decidedById != null) {
            Manager decidedBy = managerRepository.findById(decidedById)
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            leaveRequest.setDecidedBy(decidedBy);
        }

        return toDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    public void deleteLeaveRequest(UUID id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        leaveRequestRepository.delete(leaveRequest);
    }

    private void fillLeaveRequest(LeaveRequest leaveRequest, LeaveRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        leaveRequest.setEmployee(employee);

        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());

        if (dto.getDecidedById() != null) {
            Manager decidedBy = managerRepository.findById(dto.getDecidedById())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            leaveRequest.setDecidedBy(decidedBy);
        } else {
            leaveRequest.setDecidedBy(null);
        }
    }

    private LeaveRequestDto toDto(LeaveRequest leaveRequest) {
        return new LeaveRequestDto(
                leaveRequest.getId(),
                leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getId() : null,
                leaveRequest.getDecidedBy() != null ? leaveRequest.getDecidedBy().getId() : null,
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getReason(),
                leaveRequest.getStatus(),
                leaveRequest.getCreatedAt(),
                leaveRequest.getDecidedAt()
        );
    }
}
