package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.dto.FileUploadResponse;
import com.example.restaurantservice.dto.SearchCriteria;
import com.example.restaurantservice.entity.Dish;
import com.example.restaurantservice.entity.Restaurant;
import com.example.restaurantservice.exception.ResourceNotFoundException;
import com.example.restaurantservice.exception.ValidationException;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DishService {

    private final DishRepository dishRepository;
    private final RestaurantRepository restaurantRepository;
    private final FileStorageService fileStorageService;

    private DishDTO toDTO(Dish dish) {
        return DishDTO.builder()
                .id(dish.getId())
                .name(dish.getName())
                .description(dish.getDescription())
                .price(dish.getPrice())
                .imageUrl(dish.getImageUrl())
                .restaurantId(dish.getRestaurant().getId())
                .restaurantName(dish.getRestaurant().getName())
                .deleted(dish.isDeleted())
                .createdAt(dish.getCreatedAt())
                .updatedAt(dish.getUpdatedAt())
                .build();
    }

    private Dish toEntity(DishDTO dto, Restaurant restaurant) {
        return Dish.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .restaurant(restaurant)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<DishDTO> getAllDishes(SearchCriteria criteria) {
        Pageable pageable = createPageable(criteria);
        Page<Dish> dishesPage;

        if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isEmpty()) {
            dishesPage = dishRepository.search(criteria.getSearchTerm(), pageable);
        } else if (criteria.getMinPrice() != null || criteria.getMaxPrice() != null) {
            BigDecimal minPrice = criteria.getMinPrice() != null ? criteria.getMinPrice() : BigDecimal.ZERO;
            BigDecimal maxPrice = criteria.getMaxPrice() != null ? criteria.getMaxPrice() : new BigDecimal("1000000");
            dishesPage = dishRepository.findByPriceBetweenAndDeletedFalse(minPrice, maxPrice, pageable);
        } else {
            dishesPage = dishRepository.findByDeletedFalse(pageable);
        }

        return dishesPage.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<DishDTO> getDishesByRestaurant(Long restaurantId, SearchCriteria criteria) {
        Pageable pageable = createPageable(criteria);
        Page<Dish> dishesPage = dishRepository.findByRestaurantIdAndFilters(
                restaurantId,
                criteria.getSearchTerm(),
                criteria.getMinPrice(),
                criteria.getMaxPrice(),
                pageable);

        return dishesPage.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public DishDTO getDishById(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + id));

        if (dish.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо было удалено с id: " + id);
        }

        return toDTO(dish);
    }

    @Transactional
    public DishDTO createDish(DishDTO dishDTO) {
        if (dishRepository.existsByNameAndRestaurantIdAndDeletedFalse(dishDTO.getName(), dishDTO.getRestaurantId())) {
            throw new ValidationException("Блюдо с названием '" + dishDTO.getName() + "' уже существует в этом ресторане");
        }

        Restaurant restaurant = restaurantRepository.findById(dishDTO.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + dishDTO.getRestaurantId()));

        Dish dish = toEntity(dishDTO, restaurant);
        Dish saved = dishRepository.save(dish);
        log.info("Создано блюдо с id: {}", saved.getId());
        return toDTO(saved);
    }

    @Transactional
    public DishDTO updateDish(Long id, DishDTO dishDTO) {
        Dish existing = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + id));

        if (existing.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо было удалено с id: " + id);
        }

        if ((!existing.getName().equals(dishDTO.getName()) ||
                !existing.getRestaurant().getId().equals(dishDTO.getRestaurantId())) &&
                dishRepository.existsByNameAndRestaurantIdAndDeletedFalse(dishDTO.getName(),
                        dishDTO.getRestaurantId())) {
            throw new ValidationException("Блюдо с названием '" + dishDTO.getName() + "' уже существует в этом ресторане");
        }

        Restaurant restaurant = restaurantRepository.findById(dishDTO.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + dishDTO.getRestaurantId()));

        existing.setName(dishDTO.getName());
        existing.setDescription(dishDTO.getDescription());
        existing.setPrice(dishDTO.getPrice());
        existing.setImageUrl(dishDTO.getImageUrl());
        existing.setRestaurant(restaurant);

        Dish updated = dishRepository.save(existing);
        log.info("Обновлено блюдо с id: {}", id);
        return toDTO(updated);
    }

    @Transactional
    public void deleteDish(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + id));

        if (dish.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо уже удалено с id: " + id);
        }

        // Delete image file if exists
        if (dish.getImageUrl() != null && !dish.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(dish.getImageUrl());
            } catch (Exception e) {
                log.warn("Failed to delete image file for dish id {}: {}", id, e.getMessage());
            }
        }

        dish.softDelete();
        dishRepository.save(dish);
        log.info("Удалено блюдо с id: {}", id);
    }

    @Transactional
    public void restoreDish(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + id));

        if (!dish.isDeleted()) {
            throw new ValidationException("Блюдо не удалено с id: " + id);
        }

        dish.restore();
        dishRepository.save(dish);
        log.info("Восстановлено блюдо с id: {}", id);
    }

    @Transactional(readOnly = true)
    public List<DishDTO> getDeletedDishes() {
        return dishRepository.findByDeletedTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Object[] getPriceStatistics() {
        return dishRepository.getPriceStatistics();
    }

    @Transactional(readOnly = true)
    public Page<DishDTO> searchDishes(String searchTerm, Pageable pageable) {
        Page<Dish> dishesPage = dishRepository.search(searchTerm, pageable);
        return dishesPage.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<DishDTO> getDishesByRestaurantId(Long restaurantId) {
        return dishRepository.findAllByRestaurantId(restaurantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long countDishesByRestaurantId(Long restaurantId) {
        return dishRepository.countByRestaurantId(restaurantId);
    }

    // === НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ ===

    @Transactional
    public DishDTO uploadDishImage(Long dishId, MultipartFile image) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + dishId));

        if (dish.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо было удалено с id: " + dishId);
        }

        // Delete old image if exists
        if (dish.getImageUrl() != null && !dish.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(dish.getImageUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old image for dish id {}: {}", dishId, e.getMessage());
            }
        }

        // Upload new image
        FileUploadResponse uploadResponse = fileStorageService.storeFile(image);

        // Update dish with new image URL
        dish.setImageUrl(uploadResponse.getFileDownloadUri());
        Dish updated = dishRepository.save(dish);

        log.info("Image uploaded for dish id: {}, image: {}", dishId, uploadResponse.getFileName());
        return toDTO(updated);
    }

    @Transactional
    public DishDTO deleteDishImage(Long dishId) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + dishId));

        if (dish.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо было удалено с id: " + dishId);
        }

        // Delete image file
        if (dish.getImageUrl() != null && !dish.getImageUrl().isEmpty()) {
            fileStorageService.deleteFile(dish.getImageUrl());
            dish.setImageUrl(null);
            Dish updated = dishRepository.save(dish);
            log.info("Image deleted for dish id: {}", dishId);
            return toDTO(updated);
        }

        log.info("No image to delete for dish id: {}", dishId);
        return toDTO(dish);
    }

    @Transactional
    public DishDTO updateDishWithImage(Long id, DishDTO dishDTO, MultipartFile image) {
        Dish existing = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Блюдо не найдено с id: " + id));

        if (existing.isDeleted()) {
            throw new ResourceNotFoundException("Блюдо было удалено с id: " + id);
        }

        // Check for duplicate name
        if ((!existing.getName().equals(dishDTO.getName()) ||
                !existing.getRestaurant().getId().equals(dishDTO.getRestaurantId())) &&
                dishRepository.existsByNameAndRestaurantIdAndDeletedFalse(dishDTO.getName(),
                        dishDTO.getRestaurantId())) {
            throw new ValidationException("Блюдо с названием '" + dishDTO.getName() + "' уже существует в этом ресторане");
        }

        Restaurant restaurant = restaurantRepository.findById(dishDTO.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + dishDTO.getRestaurantId()));

        // Handle image upload if provided
        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(existing.getImageUrl());
                } catch (Exception e) {
                    log.warn("Failed to delete old image for dish id {}: {}", id, e.getMessage());
                }
            }

            // Upload new image
            FileUploadResponse uploadResponse = fileStorageService.storeFile(image);
            existing.setImageUrl(uploadResponse.getFileDownloadUri());
        } else if (dishDTO.getImageUrl() == null || dishDTO.getImageUrl().isEmpty()) {
            // Clear image if no image provided in DTO
            if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                fileStorageService.deleteFile(existing.getImageUrl());
            }
            existing.setImageUrl(null);
        } else {
            // Keep existing image
            existing.setImageUrl(dishDTO.getImageUrl());
        }

        // Update other fields
        existing.setName(dishDTO.getName());
        existing.setDescription(dishDTO.getDescription());
        existing.setPrice(dishDTO.getPrice());
        existing.setRestaurant(restaurant);

        Dish updated = dishRepository.save(existing);
        log.info("Dish updated with image, id: {}", id);
        return toDTO(updated);
    }

    private Pageable createPageable(SearchCriteria criteria) {
        Sort sort = Sort.by(criteria.getSortDirection().equalsIgnoreCase("desc") ?
                        Sort.Direction.DESC : Sort.Direction.ASC,
                criteria.getSortBy());
        return PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
    }
}