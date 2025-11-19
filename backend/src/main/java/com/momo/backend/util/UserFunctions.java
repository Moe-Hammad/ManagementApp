package com.momo.backend.util;

import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UserFunctions {


    public String getUserType(User user){
        String userType= null;

        if (user instanceof Manager) {
            userType = "MANAGER";
        } else {
            userType = "EMPLOYEE";
        }
        return userType;
    }


}
