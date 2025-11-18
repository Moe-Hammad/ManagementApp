package com.momo.backend.entity;

import com.momo.backend.entity.enums.CalendarEntryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "calendar_entries")
public class CalendarEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    // Ein Kalender-Eintrag kann von einem Task kommen – muss aber nicht
    @ManyToOne
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalendarEntryType type;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime end;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime start;
}
