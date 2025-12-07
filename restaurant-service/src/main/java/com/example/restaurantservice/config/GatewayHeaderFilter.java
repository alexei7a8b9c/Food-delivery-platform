package com.example.restaurantservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class GatewayHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String username = request.getHeader("X-User-Name");
        String userId = request.getHeader("X-User-Id");
        String rolesHeader = request.getHeader("X-User-Roles");
        String authoritiesHeader = request.getHeader("X-User-Authorities");
        String jwtValidated = request.getHeader("X-JWT-Validated");

        log.info("GatewayHeaderFilter - Request: {} {}, User: {}",
                request.getMethod(), request.getRequestURI(), username);

        // Если заголовки от gateway присутствуют, устанавливаем аутентификацию
        if (username != null && !username.isEmpty() &&
                jwtValidated != null && "true".equals(jwtValidated)) {

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();

            // Обрабатываем роли из заголовка X-User-Roles
            if (rolesHeader != null && !rolesHeader.isEmpty()) {
                String[] roles = rolesHeader.split(",");
                for (String role : roles) {
                    role = role.trim();
                    if (!role.isEmpty()) {
                        // Нормализуем роль - добавляем ROLE_ префикс если его нет
                        String authority;
                        if (role.startsWith("ROLE_")) {
                            authority = role;
                        } else {
                            authority = "ROLE_" + role.toUpperCase();
                        }
                        authorities.add(new SimpleGrantedAuthority(authority));
                    }
                }
            }

            // Обрабатываем authorities из заголовка X-User-Authorities
            if (authoritiesHeader != null && !authoritiesHeader.isEmpty()) {
                String[] auths = authoritiesHeader.split(",");
                for (String auth : auths) {
                    auth = auth.trim();
                    if (!auth.isEmpty()) {
                        // Проверяем, есть ли уже такая authority
                        boolean authorityExists = false;
                        for (SimpleGrantedAuthority existing : authorities) {
                            if (existing.getAuthority().equals(auth)) {
                                authorityExists = true;
                                break;
                            }
                        }
                        if (!authorityExists) {
                            authorities.add(new SimpleGrantedAuthority(auth));
                        }
                    }
                }
            }

            // Если нет authorities, добавляем ROLE_USER по умолчанию
            if (authorities.isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }

            // Создаем authentication token
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            // Устанавливаем дополнительные детали
            authentication.setDetails(userId);

            // Устанавливаем в SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("Authentication set for user: {} with {} authorities",
                    username, authorities.size());

        } else if (request.getRequestURI().startsWith("/api/admin")) {
            // Для admin endpoints требуем аутентификацию
            log.warn("Access to admin endpoint without gateway headers: {}", request.getRequestURI());
        }

        // Продолжаем цепочку фильтров
        filterChain.doFilter(request, response);
    }
}