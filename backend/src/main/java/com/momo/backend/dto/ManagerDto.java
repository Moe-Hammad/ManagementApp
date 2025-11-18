package com.momo.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.momo.backend.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role = "manager";
    private List<Employee> employees;
}
