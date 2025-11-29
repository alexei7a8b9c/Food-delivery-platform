package com.example.orderservice.dto;

import com.example.orderservice.model.Payment;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {
    private Long restaurantId;
    private List<OrderItemDto> items;
    private Payment.PaymentMethod paymentMethod;
    private String deliveryAddress;
}