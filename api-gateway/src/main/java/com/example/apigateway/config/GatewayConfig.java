package com.example.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service
                .route("user-service", r -> r.path("/api/auth/**", "/api/users/**", "/api/health/user/**")
                        .uri("lb://USER-SERVICE"))

                // Order Service - ИСПРАВЛЕННЫЕ МАРШРУТЫ
                .route("order-service", r -> r.path(
                                "/api/orders/**",
                                "/api/cart/**",
                                "/api/health/order/**"
                        )
                        .filters(f -> f
                                .addRequestHeader("X-User-Id", "16") // Временный заголовок
                                .addRequestHeader("X-User-Name", "admin@fooddelivery.com")
                                .addRequestHeader("X-User-Roles", "ROLE_ADMIN,ROLE_MANAGER,ROLE_USER")
                                .rewritePath("/api/orders/(?<segment>.*)", "/orders/${segment}")
                                .rewritePath("/api/cart/(?<segment>.*)", "/cart/${segment}")
                        )
                        .uri("lb://ORDER-SERVICE"))

                // Restaurant Service
                .route("restaurant-service", r -> r.path("/api/restaurants/**", "/api/dishes/**", "/api/menu/**",
                                "/api/health/restaurant/**")
                        .uri("lb://RESTAURANT-SERVICE"))

                .build();
    }
}