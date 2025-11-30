package com.example.restaurantservice.controller;

import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.model.Restaurant;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;
    private final DishRepository dishRepository;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        try {
            log.info("Fetching all restaurants");
            List<Restaurant> restaurants = restaurantRepository.findAll();
            log.info("Found {} restaurants", restaurants.size());
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error fetching restaurants", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        try {
            log.info("Fetching restaurant by id: {}", id);
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
            return ResponseEntity.ok(restaurant);
        } catch (Exception e) {
            log.error("Error fetching restaurant with id: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cuisine/{cuisine}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCuisine(@PathVariable String cuisine) {
        try {
            log.info("Fetching restaurants by cuisine: {}", cuisine);
            List<Restaurant> restaurants = restaurantRepository.findByCuisine(cuisine);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error fetching restaurants by cuisine: {}", cuisine, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{restaurantId}/dishes")
    public ResponseEntity<List<Dish>> getDishesByRestaurant(@PathVariable Long restaurantId) {
        try {
            log.info("Fetching dishes for restaurant id: {}", restaurantId);
            List<Dish> dishes = dishRepository.findByRestaurantId(restaurantId);
            log.info("Found {} dishes for restaurant id: {}", dishes.size(), restaurantId);
            return ResponseEntity.ok(dishes);
        } catch (Exception e) {
            log.error("Error fetching dishes for restaurant id: {}", restaurantId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}