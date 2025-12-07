package com.momo.backend.controller;

import com.momo.backend.dto.RequestDto;
import com.momo.backend.entity.enums.RequestStatus;
import com.momo.backend.service.interfaces.RequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@Tag(name = "Requests", description = "Manager-Employee Anfragen")
public class RequestController {

    private final RequestService requestService;

    @PostMapping
    @Operation(summary = "Neue Anfrage senden")
    public ResponseEntity<RequestDto> create(@RequestBody RequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(dto));
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Alle Anfragen eines Managers abrufen")
    public ResponseEntity<List<RequestDto>> getForManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(requestService.getRequestsForManager(managerId));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Alle Anfragen f\u00fcr einen Employee abrufen")
    public ResponseEntity<List<RequestDto>> getForEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(requestService.getRequestsForEmployee(employeeId));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Status einer Anfrage \u00e4ndern (APPROVED/REJECTED)")
    public ResponseEntity<RequestDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam RequestStatus status
    ) {
        return ResponseEntity.ok(requestService.updateStatus(id, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Einzelne Anfrage abrufen")
    public ResponseEntity<RequestDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.getById(id));
    }
}
