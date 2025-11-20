package com.momo.backend.controller;

import com.momo.backend.dto.TaskAssignmentDto;
import com.momo.backend.entity.enums.AssignmentStatus;
import com.momo.backend.service.interfaces.TaskAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/task-assignments")
@RequiredArgsConstructor
@Tag(name = "Task Assignments", description = "Zuweisungen von Tasks zu Employees")
public class TaskAssignmentController {

    private final TaskAssignmentService taskAssignmentService;

    @PostMapping
    @Operation(summary = "Assignment anlegen")
    public ResponseEntity<TaskAssignmentDto> createAssignment(@RequestBody TaskAssignmentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskAssignmentService.createAssignment(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Assignment nach ID abrufen")
    public ResponseEntity<TaskAssignmentDto> getAssignment(@PathVariable UUID id) {
        return ResponseEntity.ok(taskAssignmentService.getAssignment(id));
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Alle Assignments zu einem Task abrufen")
    public ResponseEntity<List<TaskAssignmentDto>> getAssignmentsForTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskAssignmentService.getAssignmentsForTask(taskId));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Alle Assignments für einen Employee abrufen")
    public ResponseEntity<List<TaskAssignmentDto>> getAssignmentsForEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(taskAssignmentService.getAssignmentsForEmployee(employeeId));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Status eines Assignments aktualisieren")
    public ResponseEntity<TaskAssignmentDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam AssignmentStatus status) {
        return ResponseEntity.ok(taskAssignmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Assignment löschen")
    public ResponseEntity<Void> deleteAssignment(@PathVariable UUID id) {
        taskAssignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
