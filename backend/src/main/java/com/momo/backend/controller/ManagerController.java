package com.momo.backend.controller;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.dto.ManagerDto;
import com.momo.backend.service.interfaces.ManagerService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/managers")
public class ManagerController {

    private final ManagerService managerService;

    // ============================================
    // CREATE MANAGER
    // ============================================

    @PostMapping
    public ResponseEntity<ManagerDto> createManager(@RequestBody ManagerDto managerDto) {
        ManagerDto saved = managerService.createManager(managerDto);
        return ResponseEntity.ok(saved);
    }

    // ============================================
    // GET MANAGER BY ID
    // ============================================

    @GetMapping("/{managerId}")
    public ResponseEntity<ManagerDto> getManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(managerService.getManagerById(managerId));
    }

    // ============================================
    // GET ALL EMPLOYEES OF MANAGER
    // ============================================

    @GetMapping("/{managerId}/employees")
    public ResponseEntity<List<EmployeeDto>> getEmployeesUnderManager(@PathVariable UUID managerId) {
        return ResponseEntity.ok(managerService.getAllEmployeesUnderManager(managerId));
    }

    // ============================================
    // UPDATE MANAGER
    // ============================================

    @PutMapping("/{managerId}")
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
    public ResponseEntity<Void> deleteManager(@PathVariable UUID managerId) {
        managerService.deleteManager(managerId);
        return ResponseEntity.noContent().build();
    }

    // ============================================
    // ADD EMPLOYEE TO MANAGER
    // ============================================

    @PostMapping("/{managerId}/employees/{employeeId}")
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
    public ResponseEntity<Void> removeEmployeeFromManager(
            @PathVariable UUID managerId,
            @PathVariable UUID employeeId) {

        managerService.deleteEmployee(managerId, employeeId);
        return ResponseEntity.noContent().build();
    }

}
