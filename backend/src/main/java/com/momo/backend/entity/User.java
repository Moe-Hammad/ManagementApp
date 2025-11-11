package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "employee";


    @PrePersist
    @PreUpdate
    private void hashPassword() {
        if (password != null && !isBcryptHash(password)) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            this.password = encoder.encode(this.password);
        }
    }

    /**
     * Prüft, ob das Passwort bereits ein gültiger BCrypt-Hash ist.
     */
    private boolean isBcryptHash(String pw) {
        // alle gültigen bcrypt-hashes beginnen mit $2a$, $2b$ oder $2y$
        return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
    }


}
