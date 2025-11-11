package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
//import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
//@NoArgsConstructor
//@AllArgsConstructor
@Entity
@Table(name = "managers")

public class Manager extends User {

    // mappedBy- Die Seite hat nicht den FK
    // cascade - Änderung beim Manager werden für alle übernommen die mit ihm in Verbindung stehen
    // orphanRemoval -  wenn ein Employee entfernt wird, dann auch von der DB
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee employee) {
        employees.add(employee);
        employee.setManager(this); // ← wichtig für die Beziehung Manager ↔ Employee
    }

    public void removeEmployee(Employee employee) {
        employees.remove(employee);
        employee.setManager(null); // ← Manager-Referenz beim Employee löschen
    }


    @PrePersist
    public void assignRole() {
        super.setRole("manager");
    }
}