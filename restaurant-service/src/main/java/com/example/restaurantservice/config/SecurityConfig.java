package com.example.restaurantservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Публичные endpoints
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/uploads/**").permitAll() // Разрешаем доступ к загруженным файлам

                        // Публичные GET запросы (должны быть перед защищенными)
                        .requestMatchers("GET", "/api/restaurants/**").permitAll()
                        .requestMatchers("GET", "/api/dishes/**").permitAll()
                        .requestMatchers("GET", "/api/menu/**").permitAll()

                        // Защищенные endpoints для ресторанов
                        .requestMatchers("POST", "/api/restaurants/**").hasRole("ADMIN")
                        .requestMatchers("PUT", "/api/restaurants/**").hasRole("ADMIN")
                        .requestMatchers("DELETE", "/api/restaurants/**").hasRole("ADMIN")
                        .requestMatchers("POST", "/api/restaurants/*/restore").hasRole("ADMIN")

                        // Защищенные endpoints для блюд
                        .requestMatchers("POST", "/api/dishes/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("PUT", "/api/dishes/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("DELETE", "/api/dishes/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("POST", "/api/dishes/*/restore").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("GET", "/api/dishes/deleted").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("GET", "/api/dishes/statistics/**").hasAnyRole("ADMIN", "MANAGER")

                        // Защищенные endpoints для загрузки файлов
                        .requestMatchers("POST", "/api/files/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("DELETE", "/api/files/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("POST", "/api/dishes/*/upload-image").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("DELETE", "/api/dishes/*/image").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("POST", "/api/dishes/*/update-with-image").hasAnyRole("ADMIN", "MANAGER")

                        // Admin only endpoints
                        .requestMatchers("GET", "/api/restaurants/deleted").hasRole("ADMIN")
                        .requestMatchers("GET", "/api/restaurants/with-dishes").hasRole("ADMIN")

                        // Все остальные запросы требуют аутентификации
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Разрешенные origins
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:8080",
                "http://localhost:5173", // Vite dev server
                "http://127.0.0.1:3000",
                "http://127.0.0.1:8080"
        ));

        // Разрешенные методы
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // Разрешенные заголовки
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-User-Id",
                "X-User-Roles",
                "X-User-Authorities",
                "X-User-Name"
        ));

        // Экспозируемые заголовки
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization",
                "Content-Disposition"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour cache for preflight

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}