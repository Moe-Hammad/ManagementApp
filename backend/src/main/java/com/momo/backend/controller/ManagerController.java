package com.momo.backend.controller;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.service.interfaces.ManagerService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/managers")
@Tag(name = "Managers", description = "Manager-CRUD und Zuweisungen")
public class ManagerController {

    private final ManagerService managerService;

    // ============================================
    // CREATE MANAGER
    // ============================================

    @PostMapping
    @Operation(summary = "Manager anlegen")
    public ResponseEntity<ManagerDto> createManager(@RequestBody ManagerDto managerDto) {
        ManagerDto saved = managerService.createManager(managerDto);
        return ResponseEntity.ok(saved);
    }

    // ============================================
    // GET MANAGER BY ID
    // ============================================

    @GetMapping("/{managerId}")
    @Operation(summary = "Manager nach ID abrufen")
    public ResponseEntity<ManagerDto> getManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(managerService.getManagerById(managerId));
    }

    // ============================================
    // GET ALL EMPLOYEES OF MANAGER
    // ============================================

    @GetMapping("/{managerId}/employees")
    @Operation(summary = "Employees eines Managers abrufen")
    public ResponseEntity<List<EmployeeDto>> getEmployeesUnderManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(managerService.getAllEmployeesUnderManager(managerId));
    }

    // ============================================
    // UPDATE MANAGER
    // ============================================

    @PutMapping("/{managerId}")
    @Operation(summary = "Manager aktualisieren")
    public ResponseEntity<ManagerDto> updateManager(
            @PathVariable UUID managerId,
            @RequestBody ManagerDto update) {

        ManagerDto updated = managerService.updateManager(managerId, update);
        return ResponseEntity.ok(updated);
    }

    // ============================================
    // DELETE MANAGER
    // ============================================

    @DeleteMapping("/{managerId}")
    @Operation(summary = "Manager löschen")
    public ResponseEntity<Void> deleteManager(@PathVariable UUID managerId) {
        managerService.deleteManager(managerId);
        return ResponseEntity.noContent().build();
    }

    // ============================================
    // ADD EMPLOYEE TO MANAGER
    // ============================================

    @PostMapping("/{managerId}/employees/{employeeId}")
    @Operation(summary = "Employee einem Manager zuordnen")
    public ResponseEntity<Void> addEmployeeToManager(
            @PathVariable UUID managerId,
            @PathVariable UUID employeeId) {

        managerService.addEmployee(managerId, employeeId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // REMOVE EMPLOYEE FROM MANAGER
    // ============================================

    @DeleteMapping("/{managerId}/employees/{employeeId}")
    @Operation(summary = "Employee von Manager trennen")
    public ResponseEntity<Void> removeEmployeeFromManager(
            @PathVariable UUID managerId,
            @PathVariable UUID employeeId) {

        managerService.deleteEmployee(managerId, employeeId);
        return ResponseEntity.noContent().build();
    }

}
