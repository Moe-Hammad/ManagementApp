package com.momo.backend.controller;

import com.momo.backend.dto.LeaveRequestDto;
import com.momo.backend.entity.enums.LeaveStatus;
import com.momo.backend.service.interfaces.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
@Tag(name = "Leave Requests", description = "Abwesenheiten verwalten")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    @Operation(summary = "Abwesenheitsantrag erstellen")
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(@RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveRequestService.createLeaveRequest(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Abwesenheitsantrag nach ID abrufen")
    public ResponseEntity<LeaveRequestDto> getLeaveRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequest(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Alle Abwesenheiten eines Employees abrufen")
    public ResponseEntity<List<LeaveRequestDto>> getForEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsForEmployee(employeeId));
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Alle Abwesenheiten unter einem Manager abrufen")
    public ResponseEntity<List<LeaveRequestDto>> getForManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsForManager(managerId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Abwesenheiten nach Status filtern")
    public ResponseEntity<List<LeaveRequestDto>> getByStatus(@PathVariable LeaveStatus status) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByStatus(status));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Status eines Abwesenheitsantrags setzen")
    public ResponseEntity<LeaveRequestDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false) UUID decidedById
    ) {
        return ResponseEntity.ok(leaveRequestService.updateStatus(id, status, decidedById));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Abwesenheitsantrag löschen")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        leaveRequestService.deleteLeaveRequest(id);
        return ResponseEntity.noContent().build();
    }
}
