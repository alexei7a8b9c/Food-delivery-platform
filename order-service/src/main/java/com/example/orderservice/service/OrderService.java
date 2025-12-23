package com.example.orderservice.service;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponseDto;
import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
import com.example.orderservice.model.Payment;
import com.example.orderservice.repository.OrderRepository;
import com.example.orderservice.repository.OrderItemRepository;
import com.example.orderservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final OrderEventPublisher orderEventPublisher;

    @Transactional
    public OrderResponseDto placeOrder(Long userId, CreateOrderRequest request) {
        log.info("📦 Placing order for user {} from restaurant {}", userId, request.getRestaurantId());
        log.info("Customer contact info - Email: {}, Name: {}, Phone: {}",
                request.getCustomerEmail(), request.getCustomerFullName(), request.getCustomerTelephone());
        log.info("Delivery address: {}", request.getDeliveryAddress());
        log.info("Order items count: {}", request.getItems().size());

        try {
            // 1. Создаем новый заказ
            Order order = new Order();
            order.setUserId(userId);
            order.setRestaurantId(request.getRestaurantId());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setOrderDate(LocalDateTime.now());

            // 2. Устанавливаем контактную информацию
            order.setCustomerEmail(request.getCustomerEmail());
            order.setCustomerFullName(request.getCustomerFullName());
            order.setCustomerTelephone(request.getCustomerTelephone());
            order.setDeliveryAddress(request.getDeliveryAddress());

            // 3. Рассчитываем общую сумму
            Integer totalPrice = calculateTotalPrice(request.getItems());
            order.setTotalPrice(totalPrice);

            log.info("Order total price: {}", totalPrice);

            // 4. Сохраняем заказ в БД
            Order savedOrder = orderRepository.save(order);
            log.info("✅ Order created with ID: {}", savedOrder.getId());

            // 5. Создаем и сохраняем элементы заказа
            List<OrderItem> orderItems = new ArrayList<>();
            for (CreateOrderRequest.OrderItemDto itemDto : request.getItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setDishId(itemDto.getDishId());
                orderItem.setDishName(itemDto.getDishName());
                orderItem.setDishDescription(itemDto.getDishDescription());
                orderItem.setQuantity(itemDto.getQuantity());
                orderItem.setPrice(itemDto.getPrice());

                OrderItem savedItem = orderItemRepository.save(orderItem);
                orderItems.add(savedItem);

                log.info("Added order item: {} x {} = {}",
                        itemDto.getDishName(),
                        itemDto.getQuantity(),
                        itemDto.getPrice() * itemDto.getQuantity());
            }

            savedOrder.setOrderItems(orderItems);

            // 6. Создаем запись о платеже
            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            payment.setAmount(totalPrice);
            payment.setStatus(Payment.PaymentStatus.PENDING);

            // Устанавливаем метод оплаты
            if (request.getPaymentMethod() != null) {
                try {
                    payment.setMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method: {}, defaulting to CREDIT_CARD", request.getPaymentMethod());
                    payment.setMethod(Payment.PaymentMethod.CREDIT_CARD);
                }
            } else {
                payment.setMethod(Payment.PaymentMethod.CREDIT_CARD);
            }

            paymentRepository.save(payment);
            log.info("💳 Payment record created for order {}", savedOrder.getId());

            // 7. Очищаем корзину пользователя
            try {
                cartService.clearCart(userId);
                log.info("🛒 Cart cleared for user {}", userId);
            } catch (Exception e) {
                log.warn("⚠️ Could not clear cart for user {}: {}", userId, e.getMessage());
                // Не прерываем процесс заказа, если не удалось очистить корзину
            }

            // 8. Публикуем событие о создании заказа
            try {
                orderEventPublisher.publishOrderCreatedEvent(savedOrder);
                log.info("📢 Order created event published for order {}", savedOrder.getId());
            } catch (Exception e) {
                log.warn("⚠️ Could not publish order event: {}", e.getMessage());
                // Не прерываем процесс заказа, если не удалось опубликовать событие
            }

            // 9. Возвращаем ответ с данными заказа
            OrderResponseDto response = convertToDto(savedOrder);
            log.info("🎉 Order {} successfully placed for user {}", savedOrder.getId(), userId);
            log.info("📧 Contact info saved - Email: {}, Phone: {}",
                    response.getCustomerEmail(), response.getCustomerTelephone());

            return response;

        } catch (Exception e) {
            log.error("❌ Error placing order for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to place order: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getUserOrders(Long userId) {
        log.info("📋 Getting orders for user {}", userId);

        try {
            List<Order> orders = orderRepository.findByUserId(userId);
            log.info("Found {} orders for user {}", orders.size(), userId);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting orders for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to get user orders: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long orderId) {
        log.info("🔍 Getting order by ID: {}", orderId);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

            return convertToDto(order);
        } catch (Exception e) {
            log.error("Error getting order {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to get order: " + e.getMessage());
        }
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        log.info("🔄 Updating order {} status to {}", orderId, newStatus);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

            // Проверяем, можно ли обновить статус
            if (order.getStatus() == Order.OrderStatus.DELIVERED ||
                    order.getStatus() == Order.OrderStatus.CANCELLED) {
                throw new RuntimeException("Cannot update status for completed or cancelled order");
            }

            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);

            // Публикуем событие об изменении статуса
            try {
                orderEventPublisher.publishOrderStatusEvent(orderId, newStatus);
                log.info("📢 Order status event published for order {}", orderId);
            } catch (Exception e) {
                log.warn("⚠️ Could not publish status event: {}", e.getMessage());
            }

            log.info("✅ Order {} status updated to {}", orderId, newStatus);
            return convertToDto(updatedOrder);
        } catch (Exception e) {
            log.error("Error updating order {} status: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to update order status: " + e.getMessage());
        }
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return updateOrderStatus(orderId, orderStatus);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", status);
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Transactional
    public OrderResponseDto cancelOrder(Long orderId) {
        log.info("❌ Cancelling order: {}", orderId);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

            // Проверяем, можно ли отменить заказ
            if (order.getStatus() == Order.OrderStatus.DELIVERED) {
                throw new RuntimeException("Cannot cancel delivered order");
            }

            if (order.getStatus() == Order.OrderStatus.CANCELLED) {
                throw new RuntimeException("Order is already cancelled");
            }

            order.setStatus(Order.OrderStatus.CANCELLED);
            Order cancelledOrder = orderRepository.save(order);

            // Публикуем событие об отмене заказа
            try {
                orderEventPublisher.publishOrderCancelledEvent(orderId, "User cancelled");
                log.info("📢 Order cancelled event published for order {}", orderId);
            } catch (Exception e) {
                log.warn("⚠️ Could not publish cancelled event: {}", e.getMessage());
            }

            log.info("✅ Order {} cancelled", orderId);
            return convertToDto(cancelledOrder);
        } catch (Exception e) {
            log.error("Error cancelling order {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to cancel order: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        log.info("📋 Getting all orders");

        try {
            List<Order> orders = orderRepository.findAll();
            log.info("Found {} total orders", orders.size());

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting all orders: {}", e.getMessage());
            throw new RuntimeException("Failed to get all orders: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getRestaurantOrders(Long restaurantId) {
        log.info("🍽️ Getting orders for restaurant {}", restaurantId);

        try {
            List<Order> orders = orderRepository.findByRestaurantId(restaurantId);
            log.info("Found {} orders for restaurant {}", orders.size(), restaurantId);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting restaurant orders: {}", e.getMessage());
            throw new RuntimeException("Failed to get restaurant orders: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByStatus(Order.OrderStatus status) {
        log.info("📊 Getting orders by status: {}", status);

        try {
            List<Order> orders = orderRepository.findByStatus(status);
            log.info("Found {} orders with status {}", orders.size(), status);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting orders by status: {}", e.getMessage());
            throw new RuntimeException("Failed to get orders by status: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByStatus(String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return getOrdersByStatus(orderStatus);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", status);
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getUserOrdersByStatus(Long userId, Order.OrderStatus status) {
        log.info("👤 Getting orders for user {} with status {}", userId, status);

        try {
            List<Order> orders = orderRepository.findByUserIdAndStatus(userId, status);
            log.info("Found {} orders for user {} with status {}", orders.size(), userId, status);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting user orders by status: {}", e.getMessage());
            throw new RuntimeException("Failed to get user orders by status: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getRestaurantOrdersByStatus(Long restaurantId, Order.OrderStatus status) {
        log.info("🏪 Getting orders for restaurant {} with status {}", restaurantId, status);

        try {
            List<Order> orders = orderRepository.findByRestaurantIdAndStatus(restaurantId, status);
            log.info("Found {} orders for restaurant {} with status {}", orders.size(), restaurantId, status);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting restaurant orders by status: {}", e.getMessage());
            throw new RuntimeException("Failed to get restaurant orders by status: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public OrderStatistics getOrderStatistics() {
        log.info("📈 Getting order statistics");

        try {
            long totalOrders = orderRepository.count();
            long pendingOrders = orderRepository.findByStatus(Order.OrderStatus.PENDING).size();
            long deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED).size();
            long cancelledOrders = orderRepository.findByStatus(Order.OrderStatus.CANCELLED).size();

            log.info("Statistics: Total={}, Pending={}, Delivered={}, Cancelled={}",
                    totalOrders, pendingOrders, deliveredOrders, cancelledOrders);

            return new OrderStatistics(totalOrders, pendingOrders, deliveredOrders, cancelledOrders);
        } catch (Exception e) {
            log.error("Error getting order statistics: {}", e.getMessage());
            throw new RuntimeException("Failed to get order statistics: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByOrderDateBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        log.info("📅 Getting orders between {} and {}", startDate, endDate);

        try {
            List<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate);
            log.info("Found {} orders in date range", orders.size());

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting orders by date range: {}", e.getMessage());
            throw new RuntimeException("Failed to get orders by date range: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getUserOrdersByOrderDateBetween(Long userId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        log.info("📅 Getting orders for user {} between {} and {}", userId, startDate, endDate);

        try {
            List<Order> orders = orderRepository.findByUserIdAndOrderDateBetween(userId, startDate, endDate);
            log.info("Found {} orders for user {} in date range", orders.size(), userId);

            return orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting user orders by date range: {}", e.getMessage());
            throw new RuntimeException("Failed to get user orders by date range: " + e.getMessage());
        }
    }

    // Вспомогательные методы

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

        // ВАЖНО: Включаем контактную информацию
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerFullName(order.getCustomerFullName());
        dto.setCustomerTelephone(order.getCustomerTelephone()); // Телефон!
        dto.setDeliveryAddress(order.getDeliveryAddress());

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

    public void publishOrderStatusEvent(Long orderId, Order.OrderStatus newStatus) {
        try {
            orderEventPublisher.publishOrderStatusEvent(orderId, newStatus);
            log.info("Published order status event: Order {} -> {}", orderId, newStatus);
        } catch (Exception e) {
            log.error("Failed to publish order status event: {}", e.getMessage());
        }
    }

    // Класс для статистики заказов
    public static class OrderStatistics {
        private final long totalOrders;
        private final long pendingOrders;
        private final long deliveredOrders;
        private final long cancelledOrders;

        public OrderStatistics(long totalOrders, long pendingOrders, long deliveredOrders, long cancelledOrders) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.deliveredOrders = deliveredOrders;
            this.cancelledOrders = cancelledOrders;
        }

        // Геттеры
        public long getTotalOrders() { return totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
        public long getCancelledOrders() { return cancelledOrders; }
    }
}