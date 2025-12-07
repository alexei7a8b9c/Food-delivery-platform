package com.example.restaurantservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Публичные endpoints (только GET)
                        .requestMatchers("/api/restaurants/**").permitAll()  // Все GET разрешены
                        .requestMatchers("/api/menu/**").permitAll()         // Все GET разрешены
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Защищенные admin endpoints (POST, PUT, DELETE)
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MANAGER")

                        // Остальные запросы требуют аутентификации
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}