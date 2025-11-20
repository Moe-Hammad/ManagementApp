package com.momo.backend.Repository;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.User;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByEmail() {
        Employee e = new Employee();
        e.setFirstName("Max");
        e.setLastName("Mustermann");
        e.setEmail("max@test.com");
        e.setPassword("12345");
        e.setRole(UserRole.EMPLOYEE);

        userRepository.save(e);

        Optional<User> found = userRepository.findByEmail("max@test.com");

        assertTrue(found.isPresent());
        assertEquals("max@test.com", found.get().getEmail());
    }

    @Test
    void testEmailDoesNotExist() {
        Optional<User> found = userRepository.findByEmail("nope@test.com");
        assertTrue(found.isEmpty());
    }
}
