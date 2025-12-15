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

                // Order Service
                .route("order-service", r -> r.path("/api/orders/**", "/api/cart/**", "/api/health/order/**")
                        .filters(f -> f.addRequestHeader("X-User-Id", "16") // Временный заголовок
                                .addRequestHeader("X-User-Name", "test@test.com"))
                        .uri("lb://ORDER-SERVICE"))

                // Restaurant Service
                .route("restaurant-service", r -> r.path("/api/restaurants/**", "/api/dishes/**", "/api/menu/**", "/api/health/restaurant/**")
                        .uri("lb://RESTAURANT-SERVICE"))

                .build();
    }
}