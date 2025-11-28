package com.example.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto implements Serializable {
    private Long dishId;
    private Integer quantity;
    private Long restaurantId;
}