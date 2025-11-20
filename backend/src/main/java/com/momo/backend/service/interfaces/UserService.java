package com.momo.backend.service.interfaces;

import com.momo.backend.dto.UserDto;

public interface UserService {
    boolean emailExists(String email);
    UserDto loadUserDtoByEmail(String email);
}