package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.DishRequestDto;
import com.example.restaurantservice.dto.DishResponseDto;
import com.example.restaurantservice.dto.PagedResponseDto;
import com.example.restaurantservice.exception.ResourceNotFoundException;
import com.example.restaurantservice.model.Dish;
import com.example.restaurantservice.model.Restaurant;
import com.example.restaurantservice.repository.DishRepository;
import com.example.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DishService {

    private final DishRepository dishRepository;
    private final RestaurantRepository restaurantRepository;
    private final ImageStorageService imageStorageService;

    @Transactional(readOnly = true)
    public PagedResponseDto<DishResponseDto> getAllDishes(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Dish> dishPage = dishRepository.findAll(pageable);

        List<DishResponseDto> content = dishPage.getContent()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PagedResponseDto<>(
                content,
                dishPage.getNumber(),
                dishPage.getSize(),
                dishPage.getTotalElements(),
                dishPage.getTotalPages(),
                dishPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PagedResponseDto<DishResponseDto> getDishesByRestaurant(Long restaurantId, int page, int size, String sortBy, String direction) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Dish> dishPage = dishRepository.findByRestaurantId(restaurantId, pageable);

        List<DishResponseDto> content = dishPage.getContent()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PagedResponseDto<>(
                content,
                dishPage.getNumber(),
                dishPage.getSize(),
                dishPage.getTotalElements(),
                dishPage.getTotalPages(),
                dishPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public DishResponseDto getDishById(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));
        return convertToDto(dish);
    }

    @Transactional
    public DishResponseDto createDish(Long restaurantId, DishRequestDto requestDto) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

        Dish dish = new Dish();
        updateDishFromDto(dish, requestDto);
        dish.setRestaurant(restaurant);

        Dish savedDish = dishRepository.save(dish);
        log.info("Dish created with id: {} for restaurant id: {}", savedDish.getId(), restaurantId);

        return convertToDto(savedDish);
    }

    @Transactional
    public DishResponseDto updateDish(Long id, DishRequestDto requestDto) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));

        updateDishFromDto(dish, requestDto);
        Dish updatedDish = dishRepository.save(dish);
        log.info("Dish updated with id: {}", id);

        return convertToDto(updatedDish);
    }

    @Transactional
    public DishResponseDto updateDishImage(Long id, MultipartFile imageFile) throws IOException {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));

        // Удаляем старое изображение если есть
        if (dish.getImageUrl() != null) {
            imageStorageService.deleteImage(dish.getImageUrl());
        }

        // Сохраняем новое изображение
        String imageUrl = imageStorageService.storeImage(imageFile, "dishes");
        dish.setImageUrl(imageUrl);

        Dish updatedDish = dishRepository.save(dish);
        log.info("Dish image updated for id: {}", id);

        return convertToDto(updatedDish);
    }

    @Transactional
    public void deleteDish(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));

        // Soft delete
        dish.setDeleted(true);
        dishRepository.save(dish);

        // Удаляем изображение если есть
        if (dish.getImageUrl() != null) {
            imageStorageService.deleteImage(dish.getImageUrl());
        }

        log.info("Dish soft deleted with id: {}", id);
    }

    private DishResponseDto convertToDto(Dish dish) {
        DishResponseDto dto = new DishResponseDto();
        dto.setId(dish.getId());
        dto.setName(dish.getName());
        dto.setDescription(dish.getDescription());
        dto.setPrice(dish.getPrice());
        dto.setImageUrl(dish.getImageUrl());
        dto.setCategory(dish.getCategory());
        dto.setPreparationTime(dish.getPreparationTime());
        dto.setIsAvailable(dish.isAvailable());
        dto.setRestaurantId(dish.getRestaurant().getId());
        dto.setRestaurantName(dish.getRestaurant().getName());
        dto.setCreatedAt(dish.getCreatedAt());
        dto.setUpdatedAt(dish.getUpdatedAt());
        return dto;
    }

    private void updateDishFromDto(Dish dish, DishRequestDto dto) {
        dish.setName(dto.getName());
        dish.setDescription(dto.getDescription());
        dish.setPrice(dto.getPrice());
        dish.setCategory(dto.getCategory());
        dish.setPreparationTime(dto.getPreparationTime());
        dish.setAvailable(dto.getIsAvailable());
    }
}