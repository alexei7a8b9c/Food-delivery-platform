package com.example.orderservice.service;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
import com.example.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    public void publishOrderStatusEvent(Long orderId, Order.OrderStatus newStatus) {
        System.out.println("Publishing order status event: Order " + orderId + " -> " + newStatus);
        // Здесь может быть интеграция с RabbitMQ, Kafka и т.д.
    }

    @Transactional
    public OrderResponseDto placeOrder(Long userId, CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(userId);
        order.setRestaurantId(request.getRestaurantId());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalPrice(calculateTotalPrice(request.getItems()));

        Order savedOrder = orderRepository.save(order);
        publishOrderStatusEvent(savedOrder.getId(), Order.OrderStatus.PENDING);

        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemDto -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder);
                    orderItem.setDishId(itemDto.getDishId());
                    orderItem.setQuantity(itemDto.getQuantity());
                    orderItem.setPrice(itemDto.getPrice());
                    orderItem.setDishName(itemDto.getDishName());
                    orderItem.setDishDescription(itemDto.getDishDescription());
                    return orderItem;
                })
                .collect(Collectors.toList());

        savedOrder.getOrderItems().addAll(orderItems);
        orderRepository.save(savedOrder);
        cartService.clearCart(userId);

        return convertToDto(savedOrder);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        publishOrderStatusEvent(orderId, newStatus);

        return convertToDto(updatedOrder);
    }

    // ✅ ДОБАВЛЕНО: Обновить статус заказа по строке
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return updateOrderStatus(orderId, orderStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    // ✅ ДОБАВЛЕНО: Получить все заказы (для администратора)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ДОБАВЛЕНО: Получить заказы пользователя
    public List<OrderResponseDto> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public OrderResponseDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDto(order);
    }

    // ✅ ДОБАВЛЕНО: Отменить заказ
    @Transactional
    public OrderResponseDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED ||
                order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        publishOrderStatusEvent(orderId, Order.OrderStatus.CANCELLED);

        return convertToDto(cancelledOrder);
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по ресторану
    public List<OrderResponseDto> getRestaurantOrders(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по статусу (enum)
    public List<OrderResponseDto> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ДОБАВЛЕНО: Получить заказы по статусу (строка)
    public List<OrderResponseDto> getOrdersByStatus(String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return getOrdersByStatus(orderStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    // ✅ ДОБАВЛЕНО: Получить заказы пользователя по статусу
    public List<OrderResponseDto> getUserOrdersByStatus(Long userId, Order.OrderStatus status) {
        return orderRepository.findByUserIdAndStatus(userId, status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ДОБАВЛЕНО: Получить заказы ресторана по статусу
    public List<OrderResponseDto> getRestaurantOrdersByStatus(Long restaurantId, Order.OrderStatus status) {
        return orderRepository.findByRestaurantIdAndStatus(restaurantId, status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ДОБАВЛЕНО: Получить статистику заказов
    public OrderStatistics getOrderStatistics() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.findByStatus(Order.OrderStatus.PENDING).size();
        long deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED).size();

        return new OrderStatistics(totalOrders, pendingOrders, deliveredOrders);
    }

    private Integer calculateTotalPrice(List<CreateOrderRequest.OrderItemDto> items) {
        return items.stream()
                .mapToInt(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    private OrderResponseDto convertToDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus().name());
        dto.setOrderDate(order.getOrderDate());
        dto.setUserId(order.getUserId());
        dto.setRestaurantId(order.getRestaurantId());
        dto.setTotalPrice(order.getTotalPrice());

        if (order.getOrderItems() != null) {
            List<OrderResponseDto.OrderItemDto> itemDtos = order.getOrderItems().stream()
                    .map(item -> {
                        OrderResponseDto.OrderItemDto itemDto = new OrderResponseDto.OrderItemDto();
                        itemDto.setDishId(item.getDishId());
                        itemDto.setQuantity(item.getQuantity());
                        itemDto.setPrice(item.getPrice());
                        itemDto.setDishName(item.getDishName());
                        itemDto.setDishDescription(item.getDishDescription());
                        return itemDto;
                    })
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }

        return dto;
    }

    // ✅ ДОБАВЛЕНО: Класс для статистики заказов
    public static class OrderStatistics {
        private final long totalOrders;
        private final long pendingOrders;
        private final long deliveredOrders;

        public OrderStatistics(long totalOrders, long pendingOrders, long deliveredOrders) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.deliveredOrders = deliveredOrders;
        }

        // Геттеры
        public long getTotalOrders() { return totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
    }
}