package com.momo.backend.service.implementation;

import com.momo.backend.dto.Backend.EmployeeDto;
import com.momo.backend.dto.Backend.ManagerDto;
import com.momo.backend.entity.Manager;
import com.momo.backend.mapper.ManagerMapper;
import com.momo.backend.repository.ManagerRepository;
import com.momo.backend.service.ManagerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerServiceImple implements ManagerService {

    private final ManagerRepository managerRepository;
    private final ManagerMapper managerMapper;


    @Override
    public ManagerDto createManager(ManagerDto dto) {
        Manager manager = managerMapper.toEntity(dto);

        // Passwort hashen (wird automatisch durch @PrePersist in User)
        managerRepository.save(manager);

        return managerMapper.toDto(manager);
    }

    @Override
    public ManagerDto getManagerById(UUID managerId) {
        return null;
    }

    @Override
    public List<EmployeeDto> getAllEmployeesUnderManager() {
        return List.of();
    }

    @Override
    public ManagerDto updateManager(UUID managerId, ManagerDto updateManager) {
        return null;
    }

    @Override
    public void deleteEmployee(UUID managerId) {

    }
}
