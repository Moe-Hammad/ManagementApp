package com.momo.backend.Entity;

import com.momo.backend.entity.Manager;
import com.momo.backend.repository.ManagerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest  // startet nur den JPA-Kontext (keinen Webserver)
@Rollback(false) // damit du im SQL-Log siehst, was passiert
public class ManagerEntityTest {

    @Autowired
    private ManagerRepository managerRepository;

    @Test
    void shouldAssignManagerRoleOnPersist() {
        // given
        Manager manager = new Manager();
        manager.setFirstName("Max");
        manager.setLastName("Mustermann");
        manager.setEmail("max@firma.de");
        manager.setPassword("plainpassword123");

        // when
        Manager saved =managerRepository.save(manager);
        // then
        assertThat(saved.getId()).isNotNull(); // ID wurde generiert
        assertThat(saved.getRole()).isEqualTo("manager"); // @PrePersist hat Rolle gesetzt
    }

    @Test
    void shouldHashPasswordBeforeSaving() {
        // given
        Manager manager = new Manager();
        manager.setFirstName("Lisa");
        manager.setLastName("Meyer");
        manager.setEmail("lisa@firma.de");
        manager.setPassword("meinGeheimesPasswort");

        // when
        Manager saved = managerRepository.save(manager);

        // then
        assertThat(saved.getPassword()).isNotEqualTo("meinGeheimesPasswort");
        assertThat(saved.getPassword()).startsWith("$2a$"); // typische BCrypt-Struktur
    }
}
