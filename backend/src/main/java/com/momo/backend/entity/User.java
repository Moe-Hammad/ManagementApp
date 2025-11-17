package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @org.hibernate.annotations.UuidGenerator
    @Column(nullable = false, updatable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @PrePersist
    @PreUpdate
    private void hashPassword() {
        if (password != null && !isBcryptHash(password)) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            this.password = encoder.encode(this.password);
        }
    }

    private boolean isBcryptHash(String pw) {
        return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
    }
}
