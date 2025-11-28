package com.example.orderservice.controller;

import com.example.orderservice.dto.CartItemDto;
import com.example.orderservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(@RequestHeader("X-User-Id") Long userId) {
        List<CartItemDto> cartItems = cartService.getCart(userId);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CartItemDto cartItemDto) {
        cartService.addToCart(userId, cartItemDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{dishId}")
    public ResponseEntity<Void> removeFromCart(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long dishId) {
        cartService.removeFromCart(userId, dishId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update/{dishId}")
    public ResponseEntity<Void> updateQuantity(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long dishId,
            @RequestParam Integer quantity) {
        cartService.updateQuantity(userId, dishId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-Id") Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}