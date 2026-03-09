package com.example.smart_campus.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads .env file entries into the Spring Environment before any ${...}
 * placeholders are resolved. This ensures secrets like ${EMAIL_PASSWORD}
 * are available when application.properties is parsed.
 *
 * Registered via META-INF/spring/org.springframework.boot.env.EnvironmentPostProcessor.
 */
public class DotenvConfig implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
                                       SpringApplication application) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        Map<String, Object> props = new HashMap<>();
        dotenv.entries().forEach(entry -> props.put(entry.getKey(), entry.getValue()));

        // Add at lowest priority so application.properties can override
        environment.getPropertySources()
                .addLast(new MapPropertySource("dotenvProperties", props));
    }
}