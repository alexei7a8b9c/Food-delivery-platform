package com.example.restaurantservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "dish")
@Data
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Integer price;
    private String imageUrl;

    @Column(name = "restaurant_id")
    private Long restaurantId;  // Должно быть Long, а не Integer
}