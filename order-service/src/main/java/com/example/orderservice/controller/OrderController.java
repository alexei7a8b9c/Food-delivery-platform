package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.model.Order;
import com.example.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Создание заказа
    @PostMapping("/place")
    public ResponseEntity<OrderResponseDto> placeOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateOrderRequest request) {
        OrderResponseDto order = orderService.placeOrder(userId, request);
        return ResponseEntity.ok(order);
    }

    // Получить заказы пользователя
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(
            @RequestHeader("X-User-Id") Long userId) {
        List<OrderResponseDto> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    // ✅ ДОБАВЛЕНО: Получить все заказы (для администратора)
    @GetMapping("/all")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        List<OrderResponseDto> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Получить заказ по ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        OrderResponseDto order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // Обновить статус заказа
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        OrderResponseDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    // Обновить статус заказа по строке
    @PutMapping("/{orderId}/status-string")
    public ResponseEntity<OrderResponseDto> updateOrderStatusString(
            @PathVariable Long orderId,
            @RequestParam String status) {
        OrderResponseDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    // Отменить заказ
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        OrderResponseDto order = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(order);
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по ресторану
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponseDto>> getRestaurantOrders(
            @PathVariable Long restaurantId) {
        List<OrderResponseDto> orders = orderService.getRestaurantOrders(restaurantId);
        return ResponseEntity.ok(orders);
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по статусу (enum)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status) {
        List<OrderResponseDto> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по статусу (строка)
    @GetMapping("/status-string/{status}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatusString(
            @PathVariable String status) {
        List<OrderResponseDto> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // ✅ ДОБАВЛЕНО: Получить заказы пользователя по статусу
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<OrderResponseDto>> getUserOrdersByStatus(
            @PathVariable Long userId,
            @PathVariable Order.OrderStatus status) {
        List<OrderResponseDto> orders = orderService.getUserOrdersByStatus(userId, status);
        return ResponseEntity.ok(orders);
    }

    // ✅ ДОБАВЛЕНО: Получить статистику заказов
    @GetMapping("/statistics")
    public ResponseEntity<OrderService.OrderStatistics> getOrderStatistics() {
        OrderService.OrderStatistics statistics = orderService.getOrderStatistics();
        return ResponseEntity.ok(statistics);
    }
}