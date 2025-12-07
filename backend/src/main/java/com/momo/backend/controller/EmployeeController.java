package com.momo.backend.controller;

import com.momo.backend.dto.EmployeeDto;
import com.momo.backend.service.interfaces.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "CRUD für Employees")
public class EmployeeController {

    private EmployeeService employeeService;

    // Build and Employee Rest Api
    @PostMapping 
    @Operation(summary = "Employee anlegen")
    @ApiResponse(responseCode = "201", description = "Employee erstellt")
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto){
        EmployeeDto savedEmployee = employeeService.createEmployee(employeeDto);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }

    // Build and get Employee REST API

    @GetMapping("{id}")
    @Operation(summary = "Employee nach ID abrufen")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable("id") UUID employeeId){
        EmployeeDto employeeDto = employeeService.getEmployeeById(employeeId);
        return new ResponseEntity<>(employeeDto, HttpStatus.OK);
    }

    // Build and get All Employees Rest API

    @GetMapping
    @Operation(summary = "Alle Employees abrufen")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees(){
        List<EmployeeDto> employeeDtoList = employeeService.getAllEmployees();
        return new ResponseEntity<>(employeeDtoList, HttpStatus.OK);
    }

    @GetMapping("/unassigned")
    @Operation(summary = "Alle Employees ohne Manager abrufen (optional Suche)")
    public ResponseEntity<List<EmployeeDto>> getUnassignedEmployees(
            @RequestParam(value = "query", required = false) String query
    ){
        List<EmployeeDto> employeeDtoList = employeeService.getUnassignedEmployees(query);
        return new ResponseEntity<>(employeeDtoList, HttpStatus.OK);
    }

    // Build and Update Employees Rest API

    @PutMapping("{id}")
    @Operation(summary = "Employee aktualisieren")
    public  ResponseEntity<EmployeeDto> updateEmployee(@PathVariable ("id") UUID employId, @RequestBody EmployeeDto em){
        EmployeeDto employeeDto = employeeService.updateEmployee(employId,em);
        return new ResponseEntity<>(employeeDto,HttpStatus.OK );
    }
    @DeleteMapping("{id}")
    // Delete Employee Rest API
    @Operation(summary = "Employee löschen")
    public ResponseEntity<EmployeeDto> deleteEmployee(@PathVariable ("id") UUID employeeId){
        employeeService.deleteEmployee(employeeId);
        return new ResponseEntity<>(HttpStatus.OK );
    }
}
