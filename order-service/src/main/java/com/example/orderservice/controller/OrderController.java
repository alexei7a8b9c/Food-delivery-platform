package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

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
            response.setEmail("user@example.com"); // Это должно быть из user-service
            response.setFullName("User Name"); // Это должно быть из user-service
            response.setTelephone("+1234567890"); // Это должно быть из user-service
            response.setFromUserService(false); // Флаг, что данные не из user-service

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Существующие методы...
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Order service is working!");
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateOrderRequest orderRequest) {

        System.out.println("Creating order for user: " + userId);
        System.out.println("Order request: " + orderRequest);
        System.out.println("Customer info: " + orderRequest.getCustomerEmail() + ", " +
                orderRequest.getCustomerFullName() + ", " +
                orderRequest.getCustomerTelephone());

        OrderResponseDto order = orderService.placeOrder(userId, orderRequest);
        return ResponseEntity.status(201).body(order);
    }

    // Остальные методы без изменений...

    // DTO для ответа с данными пользователя
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetailsResponse {
        private Long userId;
        private String email;
        private String fullName;
        private String telephone;
        private boolean fromUserService; // Флаг, что данные реальные из user-service
    }

    // Класс для обновления статуса
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }
}