package com.momo.backend.Entity;

import com.momo.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class UserEntityTest {

    static class FakeUser extends User {}

    @Test
    void testPasswordGetsHashedWhenSaving() {
        FakeUser user = new FakeUser();
        user.setFirstName("Max");
        user.setLastName("Mustermann");
        user.setEmail("max@test.com");
        user.setPassword("1234");

        ReflectionTestUtils.invokeMethod(user, "prepareForSave");

        assertNotEquals("1234", user.getPassword());
        assertTrue(user.getPassword().startsWith("$2"));
    }

    @Test
    void testPasswordDoesNotGetRehashed() {
        FakeUser user = new FakeUser();
        user.setPassword("$2b$10$abcdefghijklmnopqrstuv");

        ReflectionTestUtils.invokeMethod(user, "prepareForSave");

        assertEquals("$2b$10$abcdefghijklmnopqrstuv", user.getPassword());
    }
}
