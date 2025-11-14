package com.momo.backend.dto.Frontend;

import com.momo.backend.entity.Manager;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeFrontDto {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Double hourlyRate;
    private Boolean availability;
    private Manager manager;
}
