package com.momo.backend.dto;

import com.momo.backend.entity.Manager;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role = "employee";
    private Double hourlyRate;
    private Boolean availability;
    private Manager manager;
}
