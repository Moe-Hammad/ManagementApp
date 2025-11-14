package com.momo.backend.mapper;

import com.momo.backend.dto.Backend.ManagerDto;
import com.momo.backend.entity.Manager;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ManagerMapper {

    Manager toEntity(ManagerDto dto);

    ManagerDto toDto(Manager manager);
}
