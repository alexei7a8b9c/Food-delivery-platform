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
            "/eureka",
            "/actuator/health",
            "/v3/api-docs",
            "/swagger-ui",
            "/api/restaurants",
            "/api/menu"
    );

    private Predicate<ServerHttpRequest> isSecured = request ->
            openEndpoints.stream().noneMatch(uri -> request.getURI().getPath().contains(uri));

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Проверяем, является ли endpoint защищенным
        if (!isSecured.test(request)) {
            return chain.filter(exchange);
        }

        // Проверяем наличие заголовка Authorization
        if (!request.getHeaders().containsKey("Authorization")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
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

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}