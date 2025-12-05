package com.momo.backend.service.implementation;

import com.momo.backend.dto.RequestDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Request;
import com.momo.backend.entity.enums.RequestStatus;
import com.momo.backend.exception.CustomAccessDeniedException;
import com.momo.backend.exception.ResourceNotFoundException;
import com.momo.backend.mapper.RequestMapper;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.repository.RequestRepository;
import com.momo.backend.service.RequestEventPublisher;
import com.momo.backend.service.base.AbstractSecuredService;
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
public class RequestServiceImple extends AbstractSecuredService implements RequestService {

    private final RequestRepository requestRepository;
    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final RequestMapper requestMapper;
    private final RequestEventPublisher requestEventPublisher;

    // ============================================================
    // CREATE REQUEST  (Only a manager can create a request)
    // ============================================================
    @Override
    @Transactional
    public RequestDto createRequest(RequestDto dto) {

        // 🔒 Stelle sicher, dass ein Manager angemeldet ist
        UUID managerId = requireManagerAndGetId();

        // 🔒 Optional: DTO-ManagerId überschreiben (falls jemand manipuliert)
        dto.setManagerId(managerId);

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getManager() != null) {
            throw new IllegalStateException("Employee already assigned to a manager");
        }

        // Prevent duplicate requests to the same employee from the same manager
        boolean alreadyRequested = requestRepository.existsByManagerIdAndEmployeeId(managerId, employee.getId());
        if (alreadyRequested) {
            throw new IllegalStateException("Request to this employee already exists.");
        }

        Request request = new Request();
        request.setManager(manager);
        request.setEmployee(employee);
        request.setMessage(dto.getMessage());
        request.setStatus(RequestStatus.PENDING);

        Request saved = requestRepository.save(request);
        RequestDto result = requestMapper.toDto(saved);

        // 🔔 WebSocket Event senden
        requestEventPublisher.publishCreated(result);

        return result;
    }

    // ============================================================
    // GET REQUESTS FOR MANAGER
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getRequestsForManager(UUID managerId) {

        // 🔒 Sicherstellen, dass Manager eingeloggt
        requireManager();

        UUID currentId = getCurrentUserId();
        if (!currentId.equals(managerId)) {
            throw new CustomAccessDeniedException(
                    "Du darfst nur deine eigenen Requests sehen."
            );
        }

        return requestRepository.findByManagerId(managerId).stream()
                .map(requestMapper::toDto)
                .toList();
    }

    // ============================================================
    // GET REQUESTS FOR EMPLOYEE
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> getRequestsForEmployee(UUID employeeId) {

        // optional Security:
        UUID currentId = getCurrentUserId();
        if (!currentId.equals(employeeId)) {
            throw new CustomAccessDeniedException(
                    "Du darfst nur deine eigenen Requests sehen."
            );
        }

        return requestRepository.findByEmployeeId(employeeId).stream()
                .map(requestMapper::toDto)
                .toList();
    }

    // ============================================================
    // GET BY ID
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public RequestDto getById(UUID id) {
        return requestMapper.toDto(
                requestRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Request not found"))
        );
    }

    // ============================================================
    // UPDATE STATUS  (Only employee should approve/reject)
    // ============================================================
    @Override
    @Transactional
    public RequestDto updateStatus(UUID requestId, RequestStatus status) {

        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        UUID currentUser = getCurrentUserId();

        // 🔒 Nur der Employee darf seinen Request annehmen / ablehnen
        if (!currentUser.equals(request.getEmployee().getId())) {
            throw new CustomAccessDeniedException(
                    "Nur der Employee darf den Request aktualisieren."
            );
        }

        request.setStatus(status);

        // ==========================================================
        // APPROVED: Employee endgültig mit Manager verknüpfen
        // ==========================================================
        if (status == RequestStatus.APPROVED) {

            Employee employee = request.getEmployee();

            // Falls zu einem anderen Manager zugeordnet
            if (employee.getManager() != null &&
                    !employee.getManager().getId().equals(request.getManager().getId())) {
                throw new IllegalStateException("Employee already assigned to another manager");
            }

            employee.setManager(request.getManager());
            employeeRepository.save(employee);
        }

        Request saved = requestRepository.save(request);
        RequestDto result = requestMapper.toDto(saved);

        // 🔔 WS Event senden
        requestEventPublisher.publishUpdated(result);

        return result;
    }
}
