package com.example.orderservice.service;

import com.example.orderservice.dto.OrderCreatedEvent;
import com.example.orderservice.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    // Константы для RabbitMQ (дублируем здесь для удобства)
    private static final String ORDER_EXCHANGE = "order.exchange";
    private static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    private static final String ORDER_STATUS_ROUTING_KEY = "order.status";

    /**
     * Публикует событие создания нового заказа
     */
    public void publishOrderCreatedEvent(Order order) {
        OrderCreatedEvent event = OrderCreatedEvent.fromOrder(order);
        rabbitTemplate.convertAndSend(
                ORDER_EXCHANGE,
                ORDER_CREATED_ROUTING_KEY,
                event
        );
        System.out.println("Published order created event: " + event);
    }

    /**
     * Публикует событие изменения статуса заказа
     */
    public void publishOrderStatusEvent(Long orderId, Order.OrderStatus newStatus) {
        String message = String.format("Order %d status changed to %s", orderId, newStatus);
        rabbitTemplate.convertAndSend(
                ORDER_EXCHANGE,
                ORDER_STATUS_ROUTING_KEY,
                message
        );
        System.out.println("Published order status event: " + message);
    }

    /**
     * Публикует событие отмены заказа
     */
    public void publishOrderCancelledEvent(Long orderId, String reason) {
        String message = String.format("Order %d cancelled. Reason: %s", orderId, reason);
        rabbitTemplate.convertAndSend(
                ORDER_EXCHANGE,
                ORDER_STATUS_ROUTING_KEY,
                message
        );
        System.out.println("Published order cancelled event: " + message);
    }

    /**
     * Публикует событие завершения заказа
     */
    public void publishOrderCompletedEvent(Long orderId) {
        String message = String.format("Order %d completed successfully", orderId);
        rabbitTemplate.convertAndSend(
                ORDER_EXCHANGE,
                ORDER_STATUS_ROUTING_KEY,
                message
        );
        System.out.println("Published order completed event: " + message);
    }
}