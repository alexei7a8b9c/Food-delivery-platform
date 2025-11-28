package com.example.apigateway.config;

import com.example.apigateway.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service routes
                .route("user-service-auth", r -> r.path("/api/auth/**")
                        .filters(f -> f.rewritePath("/api/auth/(?<segment>.*)", "/api/auth/${segment}"))
                        .uri("lb://user-service"))
                .route("user-service-users", r -> r.path("/api/users/**")
                        .filters(f -> f.filter(jwtFilter)
                                .rewritePath("/api/users/(?<segment>.*)", "/api/users/${segment}"))
                        .uri("lb://user-service"))

                // Order Service routes
                .route("order-service-orders", r -> r.path("/api/orders/**")
                        .filters(f -> f.filter(jwtFilter)
                                .rewritePath("/api/orders/(?<segment>.*)", "/api/orders/${segment}"))
                        .uri("lb://order-service"))
                .route("order-service-cart", r -> r.path("/api/cart/**")
                        .filters(f -> f.filter(jwtFilter)
                                .rewritePath("/api/cart/(?<segment>.*)", "/api/cart/${segment}"))
                        .uri("lb://order-service"))

                // Restaurant Service routes
                .route("restaurant-service-restaurants", r -> r.path("/api/restaurants/**")
                        .filters(f -> f.filter(jwtFilter)
                                .rewritePath("/api/restaurants/(?<segment>.*)", "/api/restaurants/${segment}"))
                        .uri("lb://restaurant-service"))
                .route("restaurant-service-menu", r -> r.path("/api/menu/**")
                        .filters(f -> f.filter(jwtFilter)
                                .rewritePath("/api/menu/(?<segment>.*)", "/api/menu/${segment}"))
                        .uri("lb://restaurant-service"))

                .build();
    }
}