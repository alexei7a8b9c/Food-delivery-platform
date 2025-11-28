package com.example.restaurantservice.controller;

import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.repository.DishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {
    private final DishRepository dishRepository;

    @GetMapping("/dishes")
    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    @GetMapping("/dishes/{id}")
    public Dish getDishById(@PathVariable Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dish not found"));
    }

    @GetMapping("/search")
    public List<Dish> searchDishes(@RequestParam String query) {
        return dishRepository.findAll().stream()
                .filter(dish -> dish.getName().toLowerCase().contains(query.toLowerCase()) ||
                        dish.getDescription().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }
}