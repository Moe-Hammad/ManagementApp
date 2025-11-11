package com.momo.backend.Entity;


import com.momo.backend.entity.Manager;
import com.momo.backend.entity.Employee;
import com.momo.backend.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest  // startet nur den JPA-Kontext (keinen Webserver)
@Rollback(false) // damit du im SQL-Log siehst, was passiert

public class EmployeeEntityTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    void shouldAssignEmployeeRoleOnPersist() {
        Employee employee = new Employee();
        employee.setLastName("Peter");
        employee.setFirstName("Hans");
        employee.setEmail("HansPeter@email.de");
        employee.setPassword("meinneuesPassword");

        Employee emSaved = employeeRepository.save(employee);

        assertThat(emSaved.getLastName()).isEqualTo(employee.getLastName());
        assertThat(emSaved.getPassword()).startsWith("$2a$");
        assertThat(emSaved.getRole()).isEqualTo("employee");
    }

}
