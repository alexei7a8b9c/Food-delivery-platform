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
            "/eureka/",
            "/actuator",
            "/actuator/",
            "/v3/api-docs",
            "/v3/api-docs/",
            "/swagger-ui",
            "/swagger-ui/",
            "/swagger-ui.html"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod() != null ? request.getMethod().name() : "";

        System.out.println("JwtFilter - Checking path: " + path + ", method: " + method);

        // Проверяем, является ли endpoint открытым
        boolean isOpenEndpoint = isOpenEndpoint(path, method);

        // Если endpoint открытый, пропускаем без проверки JWT
        if (isOpenEndpoint) {
            System.out.println("JwtFilter - Open endpoint accessed: " + path);
            return chain.filter(exchange);
        }

        // Проверяем наличие заголовка Authorization
        if (!request.getHeaders().containsKey("Authorization")) {
            System.out.println("JwtFilter - Missing Authorization header for: " + path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JwtFilter - Invalid Authorization header for: " + path);
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
            String roles = claims.get("roles", String.class);
            String authorities = claims.get("authorities", String.class);

            // Логируем полученные данные из JWT
            System.out.println("JwtFilter - JWT validated for user: " + username +
                    ", userId: " + userId +
                    ", roles: " + roles +
                    ", authorities: " + authorities);

            // Добавляем информацию пользователя в заголовки для downstream сервисов
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-User-Name", username)
                    .header("X-User-Id", userId != null ? userId.toString() : "")
                    .header("X-User-Roles", roles != null ? roles : "")
                    .header("X-User-Authorities", authorities != null ? authorities : "")
                    .header("X-JWT-Validated", "true")
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            System.out.println("JwtFilter - JWT validation failed for path: " + path + ", error: " + e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isOpenEndpoint(String path, String method) {
        // Разрешаем все GET запросы к ресторанам и меню
        if ("GET".equals(method)) {
            if (path.startsWith("/api/restaurants") || path.startsWith("/api/menu")) {
                return true;
            }
        }

        // Проверяем список открытых endpoints
        for (String endpoint : openEndpoints) {
            if (path.startsWith(endpoint) || path.equals(endpoint.replace("/", ""))) {
                return true;
            }
        }

        return false;
    }
}