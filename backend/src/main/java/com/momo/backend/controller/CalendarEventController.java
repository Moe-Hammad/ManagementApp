package com.momo.backend.controller;

import com.momo.backend.dto.CalendarEventDto;
import com.momo.backend.service.interfaces.CalendarEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Aggregierte Kalender-Events f\u00fcr Mitarbeiter und Manager")
public class CalendarEventController {

    private final CalendarEntryService calendarEntryService;

    @GetMapping("/me")
    @Operation(summary = "Eigene Kalender-Events abrufen")
    public ResponseEntity<List<CalendarEventDto>> getMyEvents() {
        return ResponseEntity.ok(calendarEntryService.getEventsForCurrentEmployee());
    }

    @GetMapping("/manager")
    @Operation(summary = "Alle Kalender-Events der eigenen Mitarbeiter abrufen")
    public ResponseEntity<List<CalendarEventDto>> getManagerEvents() {
        return ResponseEntity.ok(calendarEntryService.getEventsForCurrentManager());
    }
}
