package com.momo.backend.service.implementation;

import com.momo.backend.dto.Login.LoginResponse;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor

public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public static String getUserType(User user) {
        return (user instanceof Manager) ? "MANAGER" : "EMPLOYEE";
    }



    public LoginResponse loginWithBasic(String authHeader) {
    // 1. Header prüfen
    if (authHeader == null || !authHeader.toLowerCase().startsWith("basic ")) {
        throw new RuntimeException("Missing or invalid Authorization header");
    }

    // 2. "Basic " abschneiden
    String base64Credentials = authHeader.substring("Basic ".length()).trim();

    // 3. Base64 decodieren
    byte[] decodedBytes = Base64.getDecoder().decode(base64Credentials);
    String credentials = new String(decodedBytes, StandardCharsets.UTF_8);

    // 4. username:password aufsplitten
    String[] values = credentials.split(":", 2);
    if (values.length != 2) {
        throw new RuntimeException("Invalid Basic authentication token");
    }

    String username = values[0];
    String password = values[1];

    // 5. User laden (z. B. per E-Mail oder Username)
    User user = userRepository.findByEmail(username)   // oder findByUsername(...)
            .orElseThrow(() -> new RuntimeException("Error: Invalid Login"));

    // 6. Passwort prüfen
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Error: Invalid Login");
    }

    // 7. User-Typ ermitteln (falls vorhanden)
    String userType = getUserType(user);;

    // 8. JWT generieren
    String token = tokenProvider.generateToken(user.getId(), userType);

    // 9. Response bauen
    return new LoginResponse(token, user.getId().toString(), userType);
}


//    public LoginResponse login(LoginRequest request) {
//
//        String userType = null;
//        var user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("Error: Invalid Login"));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Error: Invalid Login");
//        }
//
//        userType = util.getUserType(user);
//        String token = tokenProvider.generateToken(user.getId(), userType);
//
//        return new LoginResponse(token, user.getId().toString() ,userType);
//    }


}
