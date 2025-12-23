package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // НОВЫЙ МЕТОД: Получить все заказы (для администратора)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        System.out.println("📋 Получение всех заказов (админ)");

        try {
            List<OrderResponseDto> orders = orderService.getAllOrders();
            System.out.println("✅ Найдено заказов: " + orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ Ошибка получения заказов: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    // НОВЫЙ МЕТОД: Получить заказ по ID с деталями
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long orderId) {
        System.out.println("🔍 Получение заказа по ID: " + orderId);

        try {
            OrderResponseDto order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Ошибка получения заказа #" + orderId + ": " + e.getMessage());
            return ResponseEntity.status(404).build();
        }
    }

    // ИСПРАВЛЕННЫЙ МЕТОД: Обновить статус заказа
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody StatusUpdateRequest request) {

        System.out.println("🔄 API: Обновление статуса заказа #" + orderId);
        System.out.println("📊 Запрошенный статус: " + request.getStatus());
        System.out.println("📦 Данные запроса: " + request);

        try {
            // Проверяем, что статус не пустой
            if (request.getStatus() == null || request.getStatus().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Статус не может быть пустым",
                        "orderId", orderId
                ));
            }

            // Обновляем статус
            OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus());
            System.out.println("✅ Статус заказа #" + orderId + " обновлен на: " + updatedOrder.getStatus());

            return ResponseEntity.ok(updatedOrder);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Некорректный статус: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "orderId", orderId,
                    "requestedStatus", request.getStatus()
            ));

        } catch (RuntimeException e) {
            System.err.println("❌ Ошибка обновления статуса: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Внутренняя ошибка сервера: " + e.getMessage(),
                    "orderId", orderId,
                    "requestedStatus", request.getStatus()
            ));

        } catch (Exception e) {
            System.err.println("❌ Неожиданная ошибка: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Внутренняя ошибка сервера",
                    "orderId", orderId,
                    "requestedStatus", request.getStatus(),
                    "details", e.getMessage()
            ));
        }
    }

    // НОВЫЙ МЕТОД: Получить данные пользователя по ID
    @GetMapping("/user/{userId}/details")
    public ResponseEntity<UserDetailsResponse> getUserDetails(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        // Проверяем, что пользователь запрашивает свои данные
        if (!userId.equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }

        try {
            // В реальном приложении здесь нужно получить данные из user-service
            // Пока возвращаем заглушку
            UserDetailsResponse response = new UserDetailsResponse();
            response.setUserId(userId);
            response.setEmail("user@example.com");
            response.setFullName("User Name");
            response.setTelephone("+1234567890");
            response.setFromUserService(false);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Существующие методы...
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("✅ Тестовый эндпоинт order-service работает!");
        return ResponseEntity.ok("Order service is working!");
    }

    @GetMapping("/test/auth")
    public ResponseEntity<Map<String, Object>> testAuth() {
        System.out.println("✅ Тест авторизации order-service");
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "service", "order-service",
                "auth", "working",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateOrderRequest orderRequest) {

        System.out.println("Creating order for user: " + userId);
        System.out.println("Order request: " + orderRequest);
        System.out.println("Customer info: " +
                orderRequest.getCustomerEmail() + ", " +
                orderRequest.getCustomerFullName() + ", " +
                orderRequest.getCustomerTelephone());

        OrderResponseDto order = orderService.placeOrder(userId, orderRequest);
        return ResponseEntity.status(201).body(order);
    }

    // DTO для ответа с данными пользователя
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetailsResponse {
        private Long userId;
        private String email;
        private String fullName;
        private String telephone;
        private boolean fromUserService;
    }

    // DTO для обновления статуса
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }

    // Класс для обновления статуса (сохранен для совместимости)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequestOld {
        private String status;
    }
}