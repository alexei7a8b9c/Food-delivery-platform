package com.example.restaurantservice.controller;

import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.dto.SearchCriteria;
import com.example.restaurantservice.service.DishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
@Tag(name = "Блюда", description = "API для управления блюдами")
public class DishController {

    private final DishService dishService;

    @GetMapping
    @Operation(summary = "Получить все блюда с пагинацией и фильтрацией")
    public ResponseEntity<Page<DishDTO>> getAllDishes(
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

        Page<DishDTO> dishes = dishService.getAllDishes(criteria);
        return ResponseEntity.ok(dishes);
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Получить блюда ресторана")
    public ResponseEntity<Page<DishDTO>> getDishesByRestaurant(
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

        Page<DishDTO> dishes = dishService.getDishesByRestaurant(restaurantId, criteria);
        return ResponseEntity.ok(dishes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить блюдо по ID")
    public ResponseEntity<DishDTO> getDishById(@PathVariable(name = "id") Long id) {
        DishDTO dish = dishService.getDishById(id);
        return ResponseEntity.ok(dish);
    }

    @PostMapping
    @Operation(summary = "Создать новое блюдо")
    public ResponseEntity<DishDTO> createDish(@Valid @RequestBody DishDTO dishDTO) {
        DishDTO created = dishService.createDish(dishDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить блюдо")
    public ResponseEntity<DishDTO> updateDish(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody DishDTO dishDTO) {
        DishDTO updated = dishService.updateDish(id, dishDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить блюдо (soft delete)")
    public ResponseEntity<Void> deleteDish(@PathVariable(name = "id") Long id) {
        dishService.deleteDish(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Восстановить удаленное блюдо")
    public ResponseEntity<Void> restoreDish(@PathVariable(name = "id") Long id) {
        dishService.restoreDish(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/deleted")
    @Operation(summary = "Получить все удаленные блюда")
    public ResponseEntity<List<DishDTO>> getDeletedDishes() {
        List<DishDTO> deleted = dishService.getDeletedDishes();
        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/statistics/prices")
    @Operation(summary = "Получить статистику по ценам блюд")
    public ResponseEntity<Object[]> getPriceStatistics() {
        Object[] statistics = dishService.getPriceStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/search")
    @Operation(summary = "Поиск блюд по названию или описанию")
    public ResponseEntity<Page<DishDTO>> searchDishes(
            @RequestParam(name = "searchTerm") String searchTerm,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<DishDTO> dishes = dishService.searchDishes(
                searchTerm,
                org.springframework.data.domain.PageRequest.of(page, size)
        );
        return ResponseEntity.ok(dishes);
    }

    // === НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ ===

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузить изображение для блюда")
    public ResponseEntity<DishDTO> uploadDishImage(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "image") MultipartFile image) {

        DishDTO updated = dishService.uploadDishImage(id, image);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Удалить изображение блюда")
    public ResponseEntity<DishDTO> deleteDishImage(@PathVariable(name = "id") Long id) {
        DishDTO updated = dishService.deleteDishImage(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/{id}/update-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Обновить блюдо с изображением")
    public ResponseEntity<DishDTO> updateDishWithImage(
            @PathVariable(name = "id") Long id,
            @RequestPart(name = "dish") @Valid DishDTO dishDTO,
            @RequestPart(name = "image", required = false) MultipartFile image) {

        DishDTO updated = dishService.updateDishWithImage(id, dishDTO, image);
        return ResponseEntity.ok(updated);
    }
}