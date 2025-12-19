package com.example.orderservice.controller;

import com.example.orderservice.dto.CartItemDto;
import com.example.orderservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(
            @RequestHeader("X-User-Id") String userId) {

        System.out.println("GET /api/cart called, userId: " + userId);

        try {
            Long userIdLong = Long.parseLong(userId);
            List<CartItemDto> cart = cartService.getCart(userIdLong);
            return ResponseEntity.ok(cart);
        } catch (NumberFormatException e) {
            // Если userId не число, возвращаем пустую корзину для тестирования
            System.out.println("UserId is not a number, returning test cart");
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> addToCart(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CartItemDto item) {

        System.out.println("POST /api/cart/items called, userId: " + userId);
        System.out.println("Item: " + item);

        try {
            Long userIdLong = Long.parseLong(userId);
            cartService.addToCart(userIdLong, item);

            Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Item added to cart",
                    "userId", userId,
                    "item", item
            );

            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Test item added to cart (demo mode)",
                    "userId", userId,
                    "item", item
            );
            return ResponseEntity.ok(response);
        }
    }

    // Новый метод: Обновить количество
    @PutMapping("/items/{dishId}")
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long dishId,
            @RequestBody Map<String, Integer> request) {

        Integer quantity = request.get("quantity");
        System.out.println("Updating quantity for dish " + dishId + " to " + quantity);

        try {
            Long userIdLong = Long.parseLong(userId);
            cartService.updateQuantity(userIdLong, dishId, quantity);

            Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Quantity updated",
                    "dishId", dishId,
                    "quantity", quantity
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Новый метод: Удалить из корзины
    @DeleteMapping("/items/{dishId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long dishId) {

        System.out.println("DELETE /api/cart/items/" + dishId + " called, userId: " + userId);

        try {
            Long userIdLong = Long.parseLong(userId);
            cartService.removeFromCart(userIdLong, dishId);

            Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Item removed from cart",
                    "dishId", dishId
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Новый метод: Очистить корзину
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearCart(
            @RequestHeader("X-User-Id") String userId) {

        System.out.println("DELETE /api/cart called, userId: " + userId);

        try {
            Long userIdLong = Long.parseLong(userId);
            cartService.clearCart(userIdLong);

            Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Cart cleared"
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}