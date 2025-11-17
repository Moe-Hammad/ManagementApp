package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "managers")
public class Manager extends User {

    @OneToMany(
            mappedBy = "manager",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Employee> employees = new ArrayList<>();

    @OneToMany(
            mappedBy = "manager",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Task> tasks = new ArrayList<>();

    // Convenience-Methoden

    public void addEmployee(Employee employee) {
        if (!employees.contains(employee)) {
            employees.add(employee);
            employee.setManager(this);
        }
    }

    public void removeEmployee(Employee employee) {
        if (employees.remove(employee)) {
            employee.setManager(null);
        }
    }

    public void addTask(Task task) {
        if (!tasks.contains(task)) {
            tasks.add(task);
            task.setManager(this);
        }
    }

    public void removeTask(Task task) {
        if (tasks.remove(task)) {
            task.setManager(null);
        }
    }
}
