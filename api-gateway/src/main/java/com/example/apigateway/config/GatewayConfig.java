package com.example.apigateway.config;

import com.example.apigateway.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

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
                        .filters(f -> f.rewritePath("/api/users/(?<segment>.*)", "/api/users/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://user-service"))

                // Order Service routes
                .route("order-service-orders", r -> r.path("/api/orders/**")
                        .filters(f -> f.rewritePath("/api/orders/(?<segment>.*)", "/api/orders/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://order-service"))

                .route("order-service-cart", r -> r.path("/api/cart/**")
                        .filters(f -> f.rewritePath("/api/cart/(?<segment>.*)", "/api/cart/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://order-service"))

                // Restaurant Service PUBLIC routes (GET only)
                .route("restaurant-service-restaurants-public", r ->
                        r.method(HttpMethod.GET)
                                .and().path("/api/restaurants/**")
                                .filters(f -> f.rewritePath("/api/restaurants/(?<segment>.*)", "/api/restaurants/${segment}"))
                                .uri("lb://restaurant-service"))

                .route("restaurant-service-menu-public", r ->
                        r.method(HttpMethod.GET)
                                .and().path("/api/menu/**")
                                .filters(f -> f.rewritePath("/api/menu/(?<segment>.*)", "/api/menu/${segment}"))
                                .uri("lb://restaurant-service"))

                // Restaurant Service PROTECTED routes (non-GET)
                .route("restaurant-service-restaurants-protected", r ->
                        r.path("/api/restaurants/**")
                                .and().predicate(exchange -> {
                                    HttpMethod method = exchange.getRequest().getMethod();
                                    return method != null && !HttpMethod.GET.equals(method);
                                })
                                .filters(f -> f.rewritePath("/api/restaurants/(?<segment>.*)", "/api/restaurants/${segment}")
                                        .filter(jwtFilter))
                                .uri("lb://restaurant-service"))

                .route("restaurant-service-menu-protected", r ->
                        r.path("/api/menu/**")
                                .and().predicate(exchange -> {
                                    HttpMethod method = exchange.getRequest().getMethod();
                                    return method != null && !HttpMethod.GET.equals(method);
                                })
                                .filters(f -> f.rewritePath("/api/menu/(?<segment>.*)", "/api/menu/${segment}")
                                        .filter(jwtFilter))
                                .uri("lb://restaurant-service"))

                // Restaurant Service ADMIN routes
                .route("restaurant-service-admin-restaurants", r -> r.path("/api/admin/restaurants/**")
                        .filters(f -> f.rewritePath("/api/admin/restaurants/(?<segment>.*)", "/api/admin/restaurants/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://restaurant-service"))

                .route("restaurant-service-admin-dishes", r -> r.path("/api/admin/dishes/**")
                        .filters(f -> f.rewritePath("/api/admin/dishes/(?<segment>.*)", "/api/admin/dishes/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://restaurant-service"))

                .route("restaurant-service-admin-restaurant-dishes", r -> r.path("/api/admin/restaurants/{restaurantId}/dishes/**")
                        .filters(f -> f.rewritePath("/api/admin/restaurants/(?<restaurantId>[^/]+)/dishes/(?<segment>.*)",
                                        "/api/admin/restaurants/${restaurantId}/dishes/${segment}")
                                .filter(jwtFilter))
                        .uri("lb://restaurant-service"))

                .route("restaurant-service-admin-restaurant-image", r -> r.path("/api/admin/restaurants/{id}/image")
                        .filters(f -> f.rewritePath("/api/admin/restaurants/(?<id>[^/]+)/image",
                                        "/api/admin/restaurants/${id}/image")
                                .filter(jwtFilter))
                        .uri("lb://restaurant-service"))

                .route("restaurant-service-admin-dish-image", r -> r.path("/api/admin/dishes/{id}/image")
                        .filters(f -> f.rewritePath("/api/admin/dishes/(?<id>[^/]+)/image",
                                        "/api/admin/dishes/${id}/image")
                                .filter(jwtFilter))
                        .uri("lb://restaurant-service"))
                .build();
    }
}