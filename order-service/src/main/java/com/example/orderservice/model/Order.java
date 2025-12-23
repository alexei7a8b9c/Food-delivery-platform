package com.example.orderservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OrderStatus status;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false)
    private Integer totalPrice;

    // НОВЫЕ ПОЛЯ для контактной информации
    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_full_name", length = 255)
    private String customerFullName;

    @Column(name = "customer_telephone", length = 20)
    private String customerTelephone;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    // Статусы заказа
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PREPARING,
        OUT_FOR_DELIVERY,
        DELIVERED,
        CANCELLED
    }
}