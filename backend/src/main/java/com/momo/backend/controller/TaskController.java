package com.momo.backend.controller;

import com.momo.backend.dto.TaskDto;
import com.momo.backend.service.interfaces.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Aufgabenverwaltung")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(
            summary = "Task anlegen",
            description = "Erstellt eine neue Aufgabe fuer einen Manager. Typischer Aufruf beim Anlegen eines Tasks im UI."
    )
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(taskDto));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Task nach ID abrufen",
            description = "Liefert Details einer Aufgabe fuer Detail- oder Bearbeiten-Ansichten."
    )
    public ResponseEntity<TaskDto> getTask(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping("/manager/{managerId}")
    @Operation(
            summary = "Alle Tasks eines Managers abrufen",
            description = "Listet alle Aufgaben eines Managers fuer Dashboard und Listen."
    )
    public ResponseEntity<List<TaskDto>> getTasksForManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(taskService.getTasksByManager(managerId));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Task aktualisieren",
            description = "Aktualisiert Task-Felder wie Titel, Beschreibung, Status oder Deadline."
    )
    public ResponseEntity<TaskDto> updateTask(@PathVariable UUID id, @RequestBody TaskDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Task loeschen",
            description = "Loescht eine Aufgabe dauerhaft."
    )
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
