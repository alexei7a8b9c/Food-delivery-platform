package com.example.orderservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Order service is working!");
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> orderRequest) {

        System.out.println("POST /api/orders called, userId: " + userId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Order created successfully");
        response.put("orderId", "ORD-" + System.currentTimeMillis());
        response.put("userId", userId);
        response.put("order", orderRequest);

        return ResponseEntity.status(201).body(response);
    }
}