package com.example.restaurantservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = validateToken(token);

                String username = claims.getSubject();
                String rolesString = claims.get("authorities", String.class);

                log.info("JWT authenticated user: {}, roles: {}", username, rolesString);

                if (rolesString != null && !rolesString.isEmpty()) {
                    // Преобразуем строку ролей в authorities
                    List<SimpleGrantedAuthority> authorities =
                            Stream.of(rolesString.split(","))
                                    .map(String::trim)
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toList());

                    // Создаем аутентификацию
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            } catch (Exception e) {
                log.error("JWT validation failed: {}", e.getMessage());
                sendUnauthorizedResponse(response, e);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));

        try {
            // Способ 1: для JJWT 0.11.x
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (NoSuchMethodError e1) {
            try {
                // Способ 2: для более старых версий
                return Jwts.parser()
                        .setSigningKey(key)
                        .parseClaimsJws(token)
                        .getBody();
            } catch (NoSuchMethodError e2) {
                throw new RuntimeException("Unsupported JJWT version. Check dependencies.");
            }
        }
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, Exception e) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String errorJson = String.format(
                "{\"error\": \"Invalid or expired token\", \"message\": \"%s\"}",
                e.getMessage().replace("\"", "'")
        );

        response.getWriter().write(errorJson);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        // Пропускаем публичные endpoints
        return path.startsWith("/api/health") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/actuator/health") ||
                (method != null && method.equals("GET") &&
                        (path.startsWith("/api/restaurants") ||
                                path.startsWith("/api/dishes") ||
                                path.startsWith("/api/menu")));
    }
}