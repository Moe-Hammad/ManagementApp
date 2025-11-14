package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employees")

public class Employee  extends  User {

    private Double hourlyRate;
    private Boolean availability;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Manager manager;


    @PrePersist
    public void assignRole() {
        super.setRole("employee");
    }
}
