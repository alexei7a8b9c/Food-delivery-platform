package com.example.restaurantservice.controller;

import com.example.restaurantservice.dto.*;
import com.example.restaurantservice.service.DishService;
import com.example.restaurantservice.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Restaurant Management", description = "Endpoints for managing restaurants (Admin only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminRestaurantController {

    private final RestaurantService restaurantService;
    private final DishService dishService;

    // Restaurant endpoints

    @Operation(summary = "Get all restaurants with pagination")
    @GetMapping("/restaurants")
    public ResponseEntity<PagedResponseDto<RestaurantResponseDto>> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        PagedResponseDto<RestaurantResponseDto> response = restaurantService.getAllRestaurants(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get restaurant by ID")
    @GetMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponseDto> getRestaurantById(@PathVariable Long id) {
        RestaurantResponseDto restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }

    @Operation(summary = "Create new restaurant")
    @PostMapping("/restaurants")
    public ResponseEntity<RestaurantResponseDto> createRestaurant(@Valid @RequestBody RestaurantRequestDto requestDto) {
        RestaurantResponseDto createdRestaurant = restaurantService.createRestaurant(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRestaurant);
    }

    @Operation(summary = "Update restaurant")
    @PutMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponseDto> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequestDto requestDto) {

        RestaurantResponseDto updatedRestaurant = restaurantService.updateRestaurant(id, requestDto);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @Operation(summary = "Upload restaurant image")
    @PostMapping(value = "/restaurants/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponseDto> uploadRestaurantImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) throws IOException {

        RestaurantResponseDto restaurant = restaurantService.updateRestaurantImage(id, imageFile);
        return ResponseEntity.ok(new ImageUploadResponseDto(restaurant.getImageUrl(), "Image uploaded successfully"));
    }

    @Operation(summary = "Delete restaurant (soft delete)")
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Search restaurants")
    @GetMapping("/restaurants/search")
    public ResponseEntity<List<RestaurantResponseDto>> searchRestaurants(@RequestParam String query) {
        List<RestaurantResponseDto> restaurants = restaurantService.searchRestaurants(query);
        return ResponseEntity.ok(restaurants);
    }

    // Dish endpoints

    @Operation(summary = "Get all dishes with pagination")
    @GetMapping("/dishes")
    public ResponseEntity<PagedResponseDto<DishResponseDto>> getAllDishes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        PagedResponseDto<DishResponseDto> response = dishService.getAllDishes(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get dishes by restaurant with pagination")
    @GetMapping("/restaurants/{restaurantId}/dishes")
    public ResponseEntity<PagedResponseDto<DishResponseDto>> getDishesByRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        PagedResponseDto<DishResponseDto> response = dishService.getDishesByRestaurant(restaurantId, page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get dish by ID")
    @GetMapping("/dishes/{id}")
    public ResponseEntity<DishResponseDto> getDishById(@PathVariable Long id) {
        DishResponseDto dish = dishService.getDishById(id);
        return ResponseEntity.ok(dish);
    }

    @Operation(summary = "Add dish to restaurant")
    @PostMapping("/restaurants/{restaurantId}/dishes")
    public ResponseEntity<DishResponseDto> addDish(
            @PathVariable Long restaurantId,
            @Valid @RequestBody DishRequestDto requestDto) {

        DishResponseDto createdDish = dishService.createDish(restaurantId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDish);
    }

    @Operation(summary = "Update dish")
    @PutMapping("/dishes/{id}")
    public ResponseEntity<DishResponseDto> updateDish(
            @PathVariable Long id,
            @Valid @RequestBody DishRequestDto requestDto) {

        DishResponseDto updatedDish = dishService.updateDish(id, requestDto);
        return ResponseEntity.ok(updatedDish);
    }

    @Operation(summary = "Upload dish image")
    @PostMapping(value = "/dishes/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponseDto> uploadDishImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) throws IOException {

        DishResponseDto dish = dishService.updateDishImage(id, imageFile);
        return ResponseEntity.ok(new ImageUploadResponseDto(dish.getImageUrl(), "Image uploaded successfully"));
    }

    @Operation(summary = "Delete dish (soft delete)")
    @DeleteMapping("/dishes/{id}")
    public ResponseEntity<Void> deleteDish(@PathVariable Long id) {
        dishService.deleteDish(id);
        return ResponseEntity.noContent().build();
    }
}