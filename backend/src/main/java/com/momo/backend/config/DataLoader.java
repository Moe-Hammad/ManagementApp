package com.momo.backend.config;

import com.momo.backend.entity.Employee;
import com.momo.backend.entity.Manager;
import com.momo.backend.repository.EmployeeRepository;
import com.momo.backend.repository.ManagerRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



import java.util.List;
import java.util.Random;
import java.util.UUID;

@Configuration
public class DataLoader {

    private final Random random = new Random();

    @Bean
    ApplicationRunner preloadData(ManagerRepository managerRepo) {
        return args -> {

            if (managerRepo.count() > 0) return;

            for (int i = 1; i <= 3; i++) {

                Manager m = new Manager();
                m.setId(UUID.randomUUID());
                m.setFirstName("Manager" + i);
                m.setLastName("Example" + i);

                // Manager speichern
                managerRepo.save(m);

                // Manager reloaden (sauberer Hibernate-Context)
                Manager managedManager = managerRepo.findById(m.getId()).get();

                int empCount = new Random().nextInt(4) + 2;

                for (int j = 1; j <= empCount; j++) {
                    Employee e = new Employee();
                    e.setId(UUID.randomUUID());
                    e.setFirstName("Emp" + i + "_" + j);
                    e.setLastName("Worker" + j);

                    // Beziehung richtig setzen
                    managedManager.addEmployee(e);
                }

                // Jetzt speichern → Employees kommen automatisch mit
                managerRepo.save(managedManager);
            }
        };
    }

}
