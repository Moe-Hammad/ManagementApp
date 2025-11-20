package com.momo.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Momo Workforce API",
                version = "1.0",
                description = "Swagger UI mit Beispiel-Anfragen und Antworten für Auth, Mitarbeiter- und Aufgaben-Management.",
                contact = @Contact(name = "Momo Backend")
        )
)
public class OpenApiConfig {
}
