package com.example.orderservice.dto;

import com.example.orderservice.model.Order;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private Long restaurantId;
    private Integer totalPrice;
    private LocalDateTime orderDate;
    private List<OrderItemEvent> items;

    @Data
    public static class OrderItemEvent {
        private Long dishId;
        private String dishName;
        private Integer quantity;
        private Integer price;
    }

    public static OrderCreatedEvent fromOrder(Order order) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setRestaurantId(order.getRestaurantId());
        event.setTotalPrice(order.getTotalPrice());
        event.setOrderDate(order.getOrderDate());

        List<OrderItemEvent> itemEvents = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemEvent itemEvent = new OrderItemEvent();
                    itemEvent.setDishId(item.getDishId());
                    itemEvent.setDishName(item.getDishName());
                    itemEvent.setQuantity(item.getQuantity());
                    itemEvent.setPrice(item.getPrice());
                    return itemEvent;
                })
                .toList();

        event.setItems(itemEvents);
        return event;
    }
}