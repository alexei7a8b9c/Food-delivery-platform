package com.example.restaurantservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dish")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "deleted = false")
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название блюда обязательно")
    @Size(min = 2, max = 255, message = "Название должно быть от 2 до 255 символов")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "1.00", message = "Цена должна быть не менее 1.00")
    @DecimalMax(value = "10000.00", message = "Цена не может превышать 10,000.00")
    @Digits(integer = 5, fraction = 2, message = "Цена должна иметь максимум 5 цифр до запятой и 2 после")
    @Column(name = "price", nullable = false, precision = 7, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dish_restaurant"))
    @NotNull(message = "Ресторан обязателен")
    private Restaurant restaurant;

    @Builder.Default
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Метод для soft delete
    public void softDelete() {
        this.deleted = true;
        this.updatedAt = LocalDateTime.now();
    }

    // Метод для восстановления
    public void restore() {
        this.deleted = false;
        this.updatedAt = LocalDateTime.now();
    }
}