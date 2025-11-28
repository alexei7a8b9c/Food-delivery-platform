package com.example.restaurantservice.controller;

import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.model.Restaurant;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantRepository restaurantRepository;
    private final DishRepository dishRepository;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @GetMapping("/{id}")
    public Restaurant getRestaurantById(@PathVariable Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    @GetMapping("/cuisine/{cuisine}")
    public List<Restaurant> getRestaurantsByCuisine(@PathVariable String cuisine) {
        return restaurantRepository.findByCuisine(cuisine);
    }

    @GetMapping("/{restaurantId}/dishes")
    public List<Dish> getDishesByRestaurant(@PathVariable Long restaurantId) {
        return dishRepository.findByRestaurantId(restaurantId);
    }
}