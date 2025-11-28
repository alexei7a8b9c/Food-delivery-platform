package com.example.restaurantservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurant")
@Data
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String cuisine;
    private String address;

    @OneToMany(mappedBy = "restaurantId", fetch = FetchType.LAZY)
    private List<Dish> dishes = new ArrayList<>();
}