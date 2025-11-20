package com.momo.backend.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.momo.backend.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")
public abstract class User {

    @Id
    @GeneratedValue
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @PrePersist
    @PreUpdate
    private void prepareForSave() {
        assignDefaultRole();
        if (password != null && !isBcryptHash(password)) {
            this.password = new BCryptPasswordEncoder().encode(password);
        }
    }

    private void assignDefaultRole() {
        if (this.role != null) {
            return;
        }
        if (this instanceof com.momo.backend.entity.Manager) {
            this.role = UserRole.MANAGER;
        } else if (this instanceof com.momo.backend.entity.Employee) {
            this.role = UserRole.EMPLOYEE;
        }
    }

    private boolean isBcryptHash(String pw) {
        return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
    }

}
