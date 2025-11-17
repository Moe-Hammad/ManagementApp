package com.momo.backend.Repository;

import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveUserPersistsCorrectly() {
        User u = new User();
        u.setFirstName("Max");
        u.setLastName("Mustermann");
        u.setEmail("test@test.com");
        u.setPassword("1234"); // wird gehashed

        User saved = userRepository.save(u);

        assertNotNull(saved.getId());
        assertNotEquals("1234", saved.getPassword());
        assertTrue(saved.getPassword().startsWith("$2"));
    }

    @Test
    void testFindByEmail() {
        User u = new User();
        u.setFirstName("Anna");
        u.setLastName("Schmidt");
        u.setEmail("anna@test.com");
        u.setPassword("abcd");

        userRepository.save(u);

        User result = userRepository.findByEmail("anna@test.com").orElse(null);

        assertNotNull(result);
        assertEquals("Anna", result.getFirstName());
    }
}
