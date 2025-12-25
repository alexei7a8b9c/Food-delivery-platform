package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Заказы", description = "API для управления заказами")
public class OrderController {

    private final OrderService orderService;

    // НОВЫЙ МЕТОД: Получить все заказы (для администратора)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Получить все заказы (администратор)")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        System.out.println("📋 [API Gateway] Получение всех заказов (админ)");

        try {
            List<OrderResponseDto> orders = orderService.getAllOrders();
            System.out.println("✅ [API Gateway] Найдено заказов: " + orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Ошибка получения заказов: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    // НОВЫЙ МЕТОД: Получить заказы ресторана (для менеджера/админа)
    @GetMapping("/admin/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Получить заказы ресторана")
    public ResponseEntity<List<OrderResponseDto>> getRestaurantOrders(
            @PathVariable("restaurantId") Long restaurantId) {  // <-- Явное указание имени
        System.out.println("🍽️ [API Gateway] Получение заказов ресторана ID: " + restaurantId);

        try {
            List<OrderResponseDto> orders = orderService.getRestaurantOrders(restaurantId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Ошибка получения заказов ресторана: " + e.getMessage());
            return ResponseEntity.status(500).body(List.of());
        }
    }

    // НОВЫЙ МЕТОД: Получить заказы по статусу (для админа)
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Получить заказы по статусу")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatus(
            @PathVariable("status") String status) {  // <-- Явное указание имени
        System.out.println("📊 [API Gateway] Получение заказов по статусу: " + status);

        try {
            List<OrderResponseDto> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Ошибка получения заказов по статусу: " + e.getMessage());
            return ResponseEntity.status(400).body(List.of());
        }
    }

    // НОВЫЙ МЕТОД: Получить заказ по ID с деталями
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Получить заказ по ID")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @PathVariable("orderId") Long orderId) {  // <-- Явное указание имени
        System.out.println("🔍 [API Gateway] Получение заказа по ID: " + orderId);

        try {
            OrderResponseDto order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Ошибка получения заказа #" + orderId + ": " + e.getMessage());
            return ResponseEntity.status(404).build();
        }
    }

    // ИСПРАВЛЕННЫЙ МЕТОД: Обновить статус заказа
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Обновить статус заказа")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("orderId") Long orderId,  // <-- Явное указание имени
            @RequestBody StatusUpdateRequest request) {

        System.out.println("🔄 [API Gateway] Обновление статуса заказа #" + orderId);
        System.out.println("📊 [API Gateway] Запрошенный статус: " + request.getStatus());
        System.out.println("📦 [API Gateway] Данные запроса: " + request);

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
            System.out.println("✅ [API Gateway] Статус заказа #" + orderId + " обновлен на: " + updatedOrder.getStatus());

            return ResponseEntity.ok(updatedOrder);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ [API Gateway] Некорректный статус: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "orderId", orderId,
                    "requestedStatus", request.getStatus()
            ));

        } catch (RuntimeException e) {
            System.err.println("❌ [API Gateway] Ошибка обновления статуса: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Внутренняя ошибка сервера: " + e.getMessage(),
                    "orderId", orderId,
                    "requestedStatus", request.getStatus()
            ));

        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Неожиданная ошибка: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Внутренняя ошибка сервера",
                    "orderId", orderId,
                    "requestedStatus", request.getStatus(),
                    "details", e.getMessage()
            ));
        }
    }

    // НОВЫЙ МЕТОД: Отменить заказ (админ)
    @DeleteMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Отменить заказ")
    public ResponseEntity<?> cancelOrder(
            @PathVariable("orderId") Long orderId) {  // <-- Явное указание имени
        System.out.println("❌ [API Gateway] Отмена заказа #" + orderId + " (админ)");

        try {
            OrderResponseDto cancelledOrder = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(cancelledOrder);
        } catch (RuntimeException e) {
            System.err.println("❌ [API Gateway] Ошибка отмены заказа: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "orderId", orderId
            ));
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Неожиданная ошибка при отмене заказа: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Внутренняя ошибка сервера",
                    "orderId", orderId
            ));
        }
    }

    // НОВЫЙ МЕТОД: Получить данные пользователя по ID
    @GetMapping("/user/{userId}/details")
    @Operation(summary = "Получить данные пользователя")
    public ResponseEntity<UserDetailsResponse> getUserDetails(
            @PathVariable("userId") Long userId,  // <-- Явное указание имени
            @RequestHeader("X-User-Id") Long currentUserId) {

        System.out.println("👤 [API Gateway] Получение данных пользователя: " + userId);

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

    // Тестовые эндпоинты
    @GetMapping("/test")
    @Operation(summary = "Тестовый эндпоинт")
    public ResponseEntity<String> test() {
        System.out.println("✅ [API Gateway] Тестовый эндпоинт order-service работает!");
        return ResponseEntity.ok("Order service is working!");
    }

    @GetMapping("/test/auth")
    @Operation(summary = "Тест авторизации")
    public ResponseEntity<Map<String, Object>> testAuth() {
        System.out.println("✅ [API Gateway] Тест авторизации order-service");
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "service", "order-service",
                "auth", "working",
                "timestamp", System.currentTimeMillis()
        ));
    }

    // Создание заказа
    @PostMapping
    @Operation(summary = "Создать новый заказ")
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateOrderRequest orderRequest) {

        System.out.println("📦 [API Gateway] Создание заказа для пользователя: " + userId);
        System.out.println("📦 [API Gateway] Данные заказа: " + orderRequest);
        System.out.println("📧 [API Gateway] Контактные данные: " +
                orderRequest.getCustomerEmail() + ", " +
                orderRequest.getCustomerFullName() + ", " +
                orderRequest.getCustomerTelephone());

        OrderResponseDto order = orderService.placeOrder(userId, orderRequest);
        return ResponseEntity.status(201).body(order);
    }

    // Получить заказы пользователя
    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить заказы пользователя")
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(
            @PathVariable("userId") Long userId) {  // <-- Явное указание имени
        System.out.println("📋 [API Gateway] Получение заказов пользователя ID: " + userId);

        try {
            List<OrderResponseDto> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ [API Gateway] Ошибка получения заказов пользователя: " + e.getMessage());
            return ResponseEntity.status(500).body(List.of());
        }
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