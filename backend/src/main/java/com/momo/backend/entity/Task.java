package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static jakarta.persistence.CascadeType.ALL;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private Manager manager;

    private String location;
    private int requiredEmployees;

    @Column(name = "start_time")
    private LocalDateTime start;

    @Column(name = "end_time")
    private LocalDateTime end;


    // Bis wann Employees reagieren dürfen
    private LocalDateTime responseDeadline;

    @OneToMany(mappedBy = "task", cascade = ALL, orphanRemoval = true)
    private List<TaskAssignment> assignments = new ArrayList<>();

    // Convenience-Methoden

    public void addAssignment(TaskAssignment assignment) {
        if (!assignments.contains(assignment)) {
            assignments.add(assignment);
            assignment.setTask(this);
        }
    }

    public void removeAssignment(TaskAssignment assignment) {
        if (assignments.remove(assignment)) {
            assignment.setTask(null);
        }
    }
}
