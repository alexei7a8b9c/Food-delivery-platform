package com.example.restaurantservice.controller;

import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.model.Restaurant;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/restaurants")
@RequiredArgsConstructor
public class AdminRestaurantController {

    private final RestaurantRepository restaurantRepository;
    private final DishRepository dishRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<?> getAllRestaurants() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin getAllRestaurants - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin createRestaurant - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());
        log.info("Creating restaurant: {}", restaurant);

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(savedRestaurant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin updateRestaurant - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        if (!restaurantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        restaurant.setId(id);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin deleteRestaurant - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        if (!restaurantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        restaurantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{restaurantId}/dishes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Dish> addDish(@PathVariable Long restaurantId, @RequestBody Dish dish) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin addDish - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        dish.setRestaurantId(restaurantId);
        Dish savedDish = dishRepository.save(dish);
        return ResponseEntity.ok(savedDish);
    }

    @PutMapping("/{restaurantId}/dishes/{dishId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Dish> updateDish(@PathVariable Long restaurantId, @PathVariable Long dishId, @RequestBody Dish dish) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin updateDish - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        if (!dishRepository.existsById(dishId)) {
            return ResponseEntity.notFound().build();
        }
        dish.setId(dishId);
        dish.setRestaurantId(restaurantId);
        Dish updatedDish = dishRepository.save(dish);
        return ResponseEntity.ok(updatedDish);
    }

    @DeleteMapping("/{restaurantId}/dishes/{dishId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> deleteDish(@PathVariable Long restaurantId, @PathVariable Long dishId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Admin deleteDish - User: {}, Authorities: {}",
                auth.getName(), auth.getAuthorities());

        if (!dishRepository.existsById(dishId)) {
            return ResponseEntity.notFound().build();
        }
        dishRepository.deleteById(dishId);
        return ResponseEntity.ok().build();
    }
}