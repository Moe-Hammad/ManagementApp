package com.momo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import io.github.cdimascio.dotenv.Dotenv;


@SpringBootApplication
@ComponentScan(basePackages = "com.momo.backend")
public class BackendApplication {

	public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMalformed().ignoreIfMissing().load();

        setIfPresent(dotenv, "SPRING_DATASOURCE_URL");
        setIfPresent(dotenv, "SPRING_DATASOURCE_USERNAME");
        setIfPresent(dotenv, "SPRING_DATASOURCE_PASSWORD");
        setIfPresent(dotenv, "JWT_SECRET");
        setIfPresent(dotenv, "JWT_ACCESS_TTL");
        setIfPresent(dotenv, "JWT_REFRESH_TTL");
        setIfPresent(dotenv, "REFRESH_PEPPER");
        setIfPresent(dotenv, "JWT_TTL");
		SpringApplication.run(BackendApplication.class, args);
	}

    private static void setIfPresent(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value != null && !value.isBlank()) {
            System.setProperty(key, value);
        }
    }
}
