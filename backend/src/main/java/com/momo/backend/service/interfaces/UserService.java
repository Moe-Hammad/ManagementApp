package com.momo.backend.service.interfaces;

import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.dto.UserDto;

import java.util.UUID;

public interface UserService {
    boolean emailExists(String email);
    UserDto loadUserDtoByEmail(String email);
    UserDto getUserById(UUID id);

}