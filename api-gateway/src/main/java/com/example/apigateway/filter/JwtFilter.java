package com.example.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;
import java.util.function.Predicate;

@Component
public class JwtFilter implements GatewayFilter {

    @Value("${jwt.secret}")
    private String secret;

    private final List<String> openEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/validate",
            "/api/health",
            "/api/restaurants",
            "/api/restaurants/",
            "/api/menu",
            "/api/menu/",
            "/eureka",
            "/actuator",
            "/actuator/",
            "/v3/api-docs",
            "/v3/api-docs/",
            "/swagger-ui",
            "/swagger-ui/",
            "/swagger-ui.html"
    );

    private Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();
        System.out.println("Checking path: " + path);

        // Разрешаем все GET запросы к ресторанам и меню
        if (request.getMethod() != null && "GET".equals(request.getMethod().name())) {
            if (path.startsWith("/api/restaurants") || path.startsWith("/api/menu")) {
                System.out.println("Allowing GET request to: " + path);
                return false;
            }
        }

        // Проверяем открытые endpoints
        boolean isOpen = openEndpoints.stream().anyMatch(uri ->
                path.startsWith(uri) || path.equals(uri.replace("/", ""))
        );

        System.out.println("Path: " + path + ", isOpen: " + isOpen);
        return !isOpen;
    };

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Проверяем, является ли endpoint защищенным
        if (!isSecured.test(request)) {
            System.out.println("Open endpoint accessed: " + path);
            return chain.filter(exchange);
        }

        // Проверяем наличие заголовка Authorization
        if (!request.getHeaders().containsKey("Authorization")) {
            System.out.println("Missing Authorization header for: " + path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Invalid Authorization header for: " + path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        try {
            // Валидируем JWT токен
            SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            Long userId = claims.get("userId", Long.class);

            // Добавляем username и userId в заголовки для downstream сервисов
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-User-Name", username)
                    .header("X-User-Id", userId != null ? userId.toString() : "")
                    .build();

            System.out.println("JWT validated for user: " + username + ", path: " + path);
            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            System.out.println("JWT validation failed for path: " + path + ", error: " + e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}