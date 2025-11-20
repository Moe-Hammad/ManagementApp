package com.momo.backend.dto.Login;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;        // MANAGER oder EMPLOYEE
    private Double hourlyRate;  // nur für Employees relevant
}
