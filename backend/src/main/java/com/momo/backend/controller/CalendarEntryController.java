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
    @Operation(
            summary = "Kalendereintrag anlegen",
            description = "Erstellt einen Kalendereintrag fuer einen Employee (z.B. Arbeit, Urlaub, Abwesenheit)."
    )
    public ResponseEntity<CalendarEntryDto> createEntry(@RequestBody CalendarEntryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarEntryService.createEntry(dto));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Kalendereintrag nach ID abrufen",
            description = "Liefert Details eines Kalendereintrags."
    )
    public ResponseEntity<CalendarEntryDto> getEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(calendarEntryService.getEntry(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(
            summary = "Alle Eintraege eines Employees abrufen",
            description = "Gibt alle Eintraege eines Employees fuer Kalenderansichten."
    )
    public ResponseEntity<List<CalendarEntryDto>> getEntriesForEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(calendarEntryService.getEntriesForEmployee(employeeId));
    }

    @GetMapping("/manager/{managerId}")
    @Operation(
            summary = "Alle Eintraege unter einem Manager abrufen",
            description = "Gibt alle Eintraege der Mitarbeiter eines Managers fuer Teamkalender."
    )
    public ResponseEntity<List<CalendarEntryDto>> getEntriesForManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(calendarEntryService.getEntriesForManager(managerId));
    }

    @GetMapping("/type/{type}")
    @Operation(
            summary = "Eintraege nach Typ filtern",
            description = "Filtert Eintraege nach Typ (z.B. WORK, LEAVE)."
    )
    public ResponseEntity<List<CalendarEntryDto>> getEntriesByType(@PathVariable CalendarEntryType type) {
        return ResponseEntity.ok(calendarEntryService.getEntriesByType(type));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Kalendereintrag aktualisieren",
            description = "Aktualisiert einen bestehenden Kalendereintrag."
    )
    public ResponseEntity<CalendarEntryDto> updateEntry(@PathVariable UUID id, @RequestBody CalendarEntryDto dto) {
        return ResponseEntity.ok(calendarEntryService.updateEntry(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Kalendereintrag loeschen",
            description = "Loescht einen Kalendereintrag."
    )
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        calendarEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
