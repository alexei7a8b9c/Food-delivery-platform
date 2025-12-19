package com.example.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long id;
    private String status;
    private LocalDateTime orderDate;
    private Long userId;
    private Long restaurantId;
    private Integer totalPrice;
    private List<OrderItemDto> items;

    // НОВЫЕ ПОЛЯ для контактной информации
    private String customerEmail;
    private String customerFullName;
    private String customerTelephone;
    private String deliveryAddress;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long dishId;
        private Integer quantity;
        private Integer price;
        private String dishName;
        private String dishDescription;
    }
}