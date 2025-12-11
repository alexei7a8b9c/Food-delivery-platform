package com.example.restaurantservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "deleted = false")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название ресторана обязательно")
    @Size(min = 2, max = 255, message = "Название должно быть от 2 до 255 символов")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Кухня обязательна")
    @Size(min = 2, max = 100, message = "Тип кухни должен быть от 2 до 100 символов")
    @Column(nullable = false)
    private String cuisine;

    @NotBlank(message = "Адрес обязателен")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Builder.Default
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Dish> dishes = new ArrayList<>();

    // Метод для soft delete
    public void softDelete() {
        this.deleted = true;
        this.updatedAt = LocalDateTime.now();
        // Каскадное удаление блюд
        if (dishes != null) {
            dishes.forEach(Dish::softDelete);
        }
    }

    // Метод для восстановления
    public void restore() {
        this.deleted = false;
        this.updatedAt = LocalDateTime.now();
        if (dishes != null) {
            dishes.forEach(Dish::restore);
        }
    }
}