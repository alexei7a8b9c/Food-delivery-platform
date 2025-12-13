package com.example.restaurantservice.controller;

import com.example.restaurantservice.dto.RestaurantDTO;
import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.dto.SearchCriteria;
import com.example.restaurantservice.service.RestaurantService;
import com.example.restaurantservice.service.DishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Tag(name = "Рестораны", description = "API для управления ресторанами")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final DishService dishService;

    @GetMapping
    @Operation(summary = "Получить все рестораны с пагинацией и фильтрацией")
    public ResponseEntity<Page<RestaurantDTO>> getAllRestaurants(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "cuisine", required = false) String cuisine,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "asc") String sortDirection) {

        SearchCriteria criteria = new SearchCriteria();
        criteria.setSearchTerm(search);
        criteria.setCuisine(cuisine);
        criteria.setPage(page);
        criteria.setSize(size);
        criteria.setSortBy(sortBy);
        criteria.setSortDirection(sortDirection);

        Page<RestaurantDTO> restaurants = restaurantService.getAllRestaurants(criteria);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить ресторан по ID")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable(name = "id") Long id) {
        RestaurantDTO restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/{restaurantId}/dishes")
    @Operation(summary = "Получить блюда ресторана")
    public ResponseEntity<Page<DishDTO>> getRestaurantDishes(
            @PathVariable(name = "restaurantId") Long restaurantId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "asc") String sortDirection) {

        SearchCriteria criteria = new SearchCriteria();
        criteria.setSearchTerm(search);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);
        criteria.setPage(page);
        criteria.setSize(size);
        criteria.setSortBy(sortBy);
        criteria.setSortDirection(sortDirection);

        Page<DishDTO> dishes = restaurantService.getRestaurantDishes(restaurantId, criteria);
        return ResponseEntity.ok(dishes);
    }

    @GetMapping("/with-dishes")
    @Operation(summary = "Получить рестораны с их блюдами")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsWithDishes(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "asc") String sortDirection) {

        SearchCriteria criteria = new SearchCriteria();
        criteria.setPage(page);
        criteria.setSize(size);
        criteria.setSortBy(sortBy);
        criteria.setSortDirection(sortDirection);

        List<RestaurantDTO> restaurants = restaurantService.getRestaurantsWithDishes(criteria);
        return ResponseEntity.ok(restaurants);
    }

    @PostMapping
    @Operation(summary = "Создать новый ресторан")
    public ResponseEntity<RestaurantDTO> createRestaurant(@Valid @RequestBody RestaurantDTO restaurantDTO) {
        RestaurantDTO created = restaurantService.createRestaurant(restaurantDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить ресторан")
    public ResponseEntity<RestaurantDTO> updateRestaurant(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody RestaurantDTO restaurantDTO) {
        RestaurantDTO updated = restaurantService.updateRestaurant(id, restaurantDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить ресторан (soft delete)")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable(name = "id") Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Восстановить удаленный ресторан")
    public ResponseEntity<Void> restoreRestaurant(@PathVariable(name = "id") Long id) {
        restaurantService.restoreRestaurant(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/deleted")
    @Operation(summary = "Получить все удаленные рестораны")
    public ResponseEntity<List<RestaurantDTO>> getDeletedRestaurants() {
        List<RestaurantDTO> deleted = restaurantService.getDeletedRestaurants();
        return ResponseEntity.ok(deleted);
    }
}