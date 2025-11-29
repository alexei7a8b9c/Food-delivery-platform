package com.example.restaurantservice.controller;

import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.model.Restaurant;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/restaurants")
@RequiredArgsConstructor
public class AdminRestaurantController {
    private final RestaurantRepository restaurantRepository;
    private final DishRepository dishRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(savedRestaurant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        if (!restaurantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        restaurant.setId(id);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        if (!restaurantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        restaurantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{restaurantId}/dishes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dish> addDish(@PathVariable Long restaurantId, @RequestBody Dish dish) {
        dish.setRestaurantId(restaurantId);
        Dish savedDish = dishRepository.save(dish);
        return ResponseEntity.ok(savedDish);
    }

    @PutMapping("/{restaurantId}/dishes/{dishId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dish> updateDish(@PathVariable Long restaurantId, @PathVariable Long dishId, @RequestBody Dish dish) {
        if (!dishRepository.existsById(dishId)) {
            return ResponseEntity.notFound().build();
        }
        dish.setId(dishId);
        dish.setRestaurantId(restaurantId);
        Dish updatedDish = dishRepository.save(dish);
        return ResponseEntity.ok(updatedDish);
    }

    @DeleteMapping("/{restaurantId}/dishes/{dishId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDish(@PathVariable Long restaurantId, @PathVariable Long dishId) {
        if (!dishRepository.existsById(dishId)) {
            return ResponseEntity.notFound().build();
        }
        dishRepository.deleteById(dishId);
        return ResponseEntity.ok().build();
    }
}