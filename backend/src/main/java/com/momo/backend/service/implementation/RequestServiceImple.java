package com.momo.backend.service.implementation;

import com.momo.backend.dto.RequestDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Request;
import com.momo.backend.entity.enums.RequestStatus;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.RequestMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.RequestRepository;
import com.momo.backend.service.interfaces.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Handles request lifecycle and pushes events to WebSocket subscribers.
 */
@Service
@RequiredArgsConstructor
public class RequestServiceImple implements RequestService {

    private final RequestRepository requestRepository;
    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final RequestMapper requestMapper;
    private final com.momo.backend.service.RequestEventPublisher requestEventPublisher;

    @Override
    @Transactional
    public RequestDto createRequest(RequestDto dto) {
        Manager manager = managerRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getManager() != null) {
            throw new IllegalStateException("Employee already assigned to a manager");
        }

        Request request = new Request();
        request.setManager(manager);
        request.setEmployee(employee);
        request.setMessage(dto.getMessage());
        request.setStatus(RequestStatus.PENDING);

        Request saved = requestRepository.save(request);
        RequestDto result = requestMapper.toDto(saved);
        // Publish WS event on create
        requestEventPublisher.publishCreated(result);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getRequestsForManager(UUID managerId) {
        return requestRepository.findByManagerId(managerId).stream()
                .map(requestMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getRequestsForEmployee(UUID employeeId) {
        return requestRepository.findByEmployeeId(employeeId).stream()
                .map(requestMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RequestDto getById(UUID id) {
        return requestMapper.toDto(
                requestRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Request not found"))
        );
    }

    @Override
    @Transactional
    public RequestDto updateStatus(UUID requestId, RequestStatus status) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        request.setStatus(status);

        if (status == RequestStatus.APPROVED) {
            Employee employee = request.getEmployee();
            if (employee.getManager() != null && !employee.getManager().getId().equals(request.getManager().getId())) {
                throw new IllegalStateException("Employee already assigned to another manager");
            }
            employee.setManager(request.getManager());
            employeeRepository.save(employee);
        }

        Request saved = requestRepository.save(request);
        RequestDto result = requestMapper.toDto(saved);
        // Publish WS event on status change
        requestEventPublisher.publishUpdated(result);
        return result;
    }
}
