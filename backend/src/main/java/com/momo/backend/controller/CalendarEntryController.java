package com.momo.backend.controller;

import com.momo.backend.dto.CalendarEntryDto;
import com.momo.backend.entity.enums.CalendarEntryType;
import com.momo.backend.service.interfaces.CalendarEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar-entries")
@RequiredArgsConstructor
@Tag(name = "Calendar Entries", description = "Kalendereinträge für Employees")
public class CalendarEntryController {

    private final CalendarEntryService calendarEntryService;

    @PostMapping
    @Operation(summary = "Kalendereintrag anlegen")
    public ResponseEntity<CalendarEntryDto> createEntry(@RequestBody CalendarEntryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarEntryService.createEntry(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Kalendereintrag nach ID abrufen")
    public ResponseEntity<CalendarEntryDto> getEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(calendarEntryService.getEntry(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Alle Einträge eines Employees abrufen")
    public ResponseEntity<List<CalendarEntryDto>> getEntriesForEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(calendarEntryService.getEntriesForEmployee(employeeId));
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Alle Einträge unter einem Manager abrufen")
    public ResponseEntity<List<CalendarEntryDto>> getEntriesForManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(calendarEntryService.getEntriesForManager(managerId));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Einträge nach Typ filtern")
    public ResponseEntity<List<CalendarEntryDto>> getEntriesByType(@PathVariable CalendarEntryType type) {
        return ResponseEntity.ok(calendarEntryService.getEntriesByType(type));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Kalendereintrag aktualisieren")
    public ResponseEntity<CalendarEntryDto> updateEntry(@PathVariable UUID id, @RequestBody CalendarEntryDto dto) {
        return ResponseEntity.ok(calendarEntryService.updateEntry(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Kalendereintrag löschen")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        calendarEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
