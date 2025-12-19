package com.example.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Long restaurantId;
    private List<OrderItemDto> items;
    private String paymentMethod;
    private String deliveryAddress;

    // НОВЫЕ ПОЛЯ для контактной информации
    private String customerEmail;
    private String customerFullName;
    private String customerTelephone;

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