package com.momo.backend.config;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.entity.enums.UserRole;
import com.momo.backend.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Random;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final ManagerRepository managerRepo;
    private final Random random = new Random();

    @Bean
    ApplicationRunner loadData() {
        return args -> {

            // Wenn schon Daten existieren → Preloader nicht erneut ausführen
            if (managerRepo.count() > 0) {
                return;
            }

            String[] managerEmails = {"manager@gmail.com", "manager2@mail.com"};

            for (int i = 0; i < managerEmails.length; i++) {

                // Manager erstellen
                Manager manager = new Manager();
                manager.setFirstName("Manager" + (i + 1));
                manager.setLastName("Boss");
                manager.setEmail(managerEmails[i]);
                manager.setPassword("pass123"); // wird automatisch gehashed
                manager.setRole(UserRole.MANAGER);

                // Speichern → wichtig: damit Manager in Persistence Context ist
                managerRepo.save(manager);

                int employeeCount = 3;  // immer 3 Stück

                for (int j = 1; j <= employeeCount; j++) {

                    Employee e = new Employee();
                    e.setFirstName("Employee" + j);
                    e.setLastName("Worker");
                    e.setEmail("emp" + (i + 1) + "_" + j + "@mail.com");
                    e.setHourlyRate(15.0 + j);
                    e.setAvailability(random.nextBoolean());
                    e.setPassword("pass123"); // wird gehashed
                    e.setRole(UserRole.EMPLOYEE);

                    manager.addEmployee(e); // Beziehung setzen
                }

                // Speichert Mitarbeiter automatisch mit
                managerRepo.save(manager);
            }

            System.out.println("🔥 Testdaten geladen: Manager + Employees erstellt!");
        };
    }
}
