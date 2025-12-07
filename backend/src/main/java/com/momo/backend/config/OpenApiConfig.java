package com.momo.backend.config;

import com.momo.backend.exception.ErrorResponse;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Momo Workforce API",
                version = "1.0",
                description = "Swagger UI mit Beispiel-Anfragen und Antworten f\u00fcr Auth, Mitarbeiter- und Aufgaben-Management.",
                contact = @Contact(name = "Momo Backend")
        )
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    @Bean
    public OpenAPI baseOpenAPI() {
        OpenAPI openAPI = new OpenAPI();
        openAPI.components(new Components());
        openAPI.getComponents()
                .addSchemas("ErrorResponse", ModelConverters.getInstance()
                        .read(ErrorResponse.class)
                        .get("ErrorResponse"));
        openAPI.openapi("3.0.1");
        openAPI.info(new io.swagger.v3.oas.models.info.Info()
                .title("Momo Workforce API")
                .version("1.0")
                .description("Swagger UI mit Beispiel-Anfragen und Antworten f\u00fcr Auth, Mitarbeiter- und Aufgaben-Management.")
                .contact(new io.swagger.v3.oas.models.info.Contact().name("Momo Backend")));
        return openAPI;
    }

    @Bean
    public OpenApiCustomizer secureAndDocumentErrors() {
        SecurityRequirement bearerRequirement = new SecurityRequirement().addList("bearerAuth");

        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().forEach((path, pathItem) -> pathItem.readOperations().forEach(operation -> {
                if (!path.startsWith("/api/auth")) {
                    operation.addSecurityItem(bearerRequirement);
                }

                ApiResponses responses = operation.getResponses();
                addIfMissing(responses, "400", "Bad Request");
                addIfMissing(responses, "401", "Unauthorized");
                addIfMissing(responses, "403", "Forbidden");
                addIfMissing(responses, "404", "Not Found");
                addIfMissing(responses, "500", "Internal Server Error");
            }));
        };
    }

    private void addIfMissing(ApiResponses responses, String code, String description) {
        responses.computeIfAbsent(code, key -> buildErrorResponse(description));
    }

    private ApiResponse buildErrorResponse(String description) {
        Schema<?> schema = new Schema<>().$ref("#/components/schemas/ErrorResponse");
        MediaType mediaType = new MediaType().schema(schema);
        Content content = new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, mediaType);
        return new ApiResponse().description(description).content(content);
    }
}
