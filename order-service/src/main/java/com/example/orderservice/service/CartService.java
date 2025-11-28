package com.example.orderservice.service;

import com.example.orderservice.dto.CartItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CartService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CART_KEY_PREFIX = "cart:";

    public void addToCart(Long userId, CartItemDto cartItemDto) {
        String cartKey = CART_KEY_PREFIX + userId;
        redisTemplate.opsForHash().put(cartKey,
                cartItemDto.getDishId().toString(),
                cartItemDto);
        redisTemplate.expire(cartKey, 7, TimeUnit.DAYS);
    }

    public List<CartItemDto> getCart(Long userId) {
        String cartKey = CART_KEY_PREFIX + userId;
        Map<Object, Object> cartItems = redisTemplate.opsForHash().entries(cartKey);

        List<CartItemDto> result = new ArrayList<>();
        for (Object value : cartItems.values()) {
            if (value instanceof CartItemDto) {
                result.add((CartItemDto) value);
            }
        }
        return result;
    }

    public void removeFromCart(Long userId, Long dishId) {
        String cartKey = CART_KEY_PREFIX + userId;
        redisTemplate.opsForHash().delete(cartKey, dishId.toString());
    }

    public void updateQuantity(Long userId, Long dishId, Integer quantity) {
        String cartKey = CART_KEY_PREFIX + userId;
        CartItemDto cartItem = (CartItemDto) redisTemplate.opsForHash().get(cartKey, dishId.toString());
        if (cartItem != null) {
            cartItem.setQuantity(quantity);
            redisTemplate.opsForHash().put(cartKey, dishId.toString(), cartItem);
        }
    }

    public void clearCart(Long userId) {
        String cartKey = CART_KEY_PREFIX + userId;
        redisTemplate.delete(cartKey);
    }
}