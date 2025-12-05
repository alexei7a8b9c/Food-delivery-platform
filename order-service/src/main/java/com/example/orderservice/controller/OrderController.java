package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.model.Order;
import com.example.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Создание заказа - доступно всем аутентифицированным пользователям
    @PostMapping("/place")
    public ResponseEntity<OrderResponseDto> placeOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateOrderRequest request) {
        OrderResponseDto order = orderService.placeOrder(userId, request);
        return ResponseEntity.ok(order);
    }

    // Получить заказы пользователя - доступно самому пользователю
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(
            @RequestHeader("X-User-Id") Long userId) {
        List<OrderResponseDto> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    // ✅ Получить все заказы (для администратора)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        List<OrderResponseDto> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Получить заказ по ID - доступно владельцу заказа или администратору
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        OrderResponseDto order = orderService.getOrderById(orderId);

        // Проверка прав доступа
        if (!order.getUserId().equals(userId) && !hasAdminRole()) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(order);
    }

    // Обновить статус заказа - доступно администратору или менеджеру ресторана
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        OrderResponseDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    // Обновить статус заказа по строке
    @PutMapping("/{orderId}/status-string")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OrderResponseDto> updateOrderStatusString(
            @PathVariable Long orderId,
            @RequestParam String status) {
        OrderResponseDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    // Отменить заказ - доступно владельцу заказа или администратору
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {

        OrderResponseDto order = orderService.getOrderById(orderId);

        // Проверка прав доступа
        if (!order.getUserId().equals(userId) && !hasAdminRole()) {
            return ResponseEntity.status(403).build();
        }

        OrderResponseDto cancelledOrder = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(cancelledOrder);
    }

    // ✅ Получить заказы по ресторану - доступно администратору или менеджеру
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<OrderResponseDto>> getRestaurantOrders(
            @PathVariable Long restaurantId) {
        List<OrderResponseDto> orders = orderService.getRestaurantOrders(restaurantId);
        return ResponseEntity.ok(orders);
    }

    // ✅ Получить заказы по статусу (enum) - доступно администратору
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status) {
        List<OrderResponseDto> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // ✅ Получить заказы по статусу (строка) - доступно администратору
    @GetMapping("/status-string/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatusString(
            @PathVariable String status) {
        List<OrderResponseDto> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // ✅ Получить заказы пользователя по статусу
    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<OrderResponseDto>> getUserOrdersByStatus(
            @PathVariable Long userId,
            @PathVariable Order.OrderStatus status) {
        List<OrderResponseDto> orders = orderService.getUserOrdersByStatus(userId, status);
        return ResponseEntity.ok(orders);
    }

    // ✅ Получить статистику заказов - доступно только администратору
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderService.OrderStatistics> getOrderStatistics() {
        OrderService.OrderStatistics statistics = orderService.getOrderStatistics();
        return ResponseEntity.ok(statistics);
    }

    // Вспомогательный метод для проверки роли администратора
    private boolean hasAdminRole() {
        // Здесь должна быть логика проверки ролей из заголовков
        // В реальной системе это делается через Spring Security Context
        return false; // Временно возвращаем false
    }
}