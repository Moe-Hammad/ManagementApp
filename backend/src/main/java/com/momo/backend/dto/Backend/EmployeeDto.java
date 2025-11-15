package com.momo.backend.dto.Backend;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.momo.backend.entity.Manager;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role;
    private Double hourlyRate;
    private Boolean availability;
    private Manager manager;
}
