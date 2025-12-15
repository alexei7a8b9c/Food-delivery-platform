package com.example.orderservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("GET /api/cart called, userId: " + userId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Cart endpoint is working!");
        response.put("userId", userId);
        response.put("timestamp", new Date());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> addToCart(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> item) {

        System.out.println("POST /api/cart/items called, userId: " + userId);
        System.out.println("Item: " + item);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Item added to cart");
        response.put("userId", userId);
        response.put("item", item);

        return ResponseEntity.ok(response);
    }
}