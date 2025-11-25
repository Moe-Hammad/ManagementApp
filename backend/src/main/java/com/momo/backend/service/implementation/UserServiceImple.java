package com.momo.backend.service.implementation;

import com.momo.backend.dto.UserDto;
import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.mapper.UserMapper;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserServiceImple implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public UserDto loadUserDtoByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user instanceof Manager manager) {
            return userMapper.managerToUserDto(manager);
        }
        if (user instanceof Employee employee) {
            return userMapper.employeeToUserDto(employee);
        }

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unknown user role");
    }

}
