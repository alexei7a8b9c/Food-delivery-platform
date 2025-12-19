package com.example.orderservice.service;

import com.example.orderservice.dto.CartItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CART_KEY_PREFIX = "cart:";

    public void addToCart(Long userId, CartItemDto cartItemDto) {
        String cartKey = CART_KEY_PREFIX + userId;
        try {
            // Проверяем, существует ли уже это блюдо в корзине
            CartItemDto existingItem = (CartItemDto) redisTemplate.opsForHash()
                    .get(cartKey, cartItemDto.getDishId().toString());

            if (existingItem != null) {
                // Обновляем количество
                existingItem.setQuantity(existingItem.getQuantity() + cartItemDto.getQuantity());
                redisTemplate.opsForHash().put(cartKey,
                        cartItemDto.getDishId().toString(),
                        existingItem);
            } else {
                // Добавляем новое блюдо
                redisTemplate.opsForHash().put(cartKey,
                        cartItemDto.getDishId().toString(),
                        cartItemDto);
            }

            // Устанавливаем время жизни 7 дней
            redisTemplate.expire(cartKey, 7, TimeUnit.DAYS);

            log.info("Item added to cart for user {}: {}", userId, cartItemDto.getDishId());
        } catch (Exception e) {
            log.error("Error adding to cart for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to add item to cart");
        }
    }

    public List<CartItemDto> getCart(Long userId) {
        String cartKey = CART_KEY_PREFIX + userId;
        List<CartItemDto> cartItems = new ArrayList<>();

        try {
            Map<Object, Object> items = redisTemplate.opsForHash().entries(cartKey);

            for (Object value : items.values()) {
                if (value instanceof CartItemDto) {
                    cartItems.add((CartItemDto) value);
                }
            }

            log.info("Retrieved {} items from cart for user {}", cartItems.size(), userId);
            return cartItems;
        } catch (Exception e) {
            log.error("Error getting cart for user {}: {}", userId, e.getMessage());
            return cartItems;
        }
    }

    public void removeFromCart(Long userId, Long dishId) {
        String cartKey = CART_KEY_PREFIX + userId;
        try {
            redisTemplate.opsForHash().delete(cartKey, dishId.toString());
            log.info("Item {} removed from cart for user {}", dishId, userId);
        } catch (Exception e) {
            log.error("Error removing item from cart for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to remove item from cart");
        }
    }

    public void updateQuantity(Long userId, Long dishId, Integer quantity) {
        String cartKey = CART_KEY_PREFIX + userId;
        try {
            CartItemDto cartItem = (CartItemDto) redisTemplate.opsForHash()
                    .get(cartKey, dishId.toString());
            if (cartItem != null) {
                cartItem.setQuantity(quantity);
                redisTemplate.opsForHash().put(cartKey, dishId.toString(), cartItem);
                log.info("Quantity updated for item {} to {} for user {}", dishId, quantity, userId);
            }
        } catch (Exception e) {
            log.error("Error updating quantity for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to update quantity");
        }
    }

    public void clearCart(Long userId) {
        String cartKey = CART_KEY_PREFIX + userId;
        try {
            redisTemplate.delete(cartKey);
            log.info("Cart cleared for user {}", userId);
        } catch (Exception e) {
            log.error("Error clearing cart for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to clear cart");
        }
    }
}