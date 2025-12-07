package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.PagedResponseDto;
import com.example.restaurantservice.dto.RestaurantRequestDto;
import com.example.restaurantservice.dto.RestaurantResponseDto;
import com.example.restaurantservice.exception.BusinessException;
import com.example.restaurantservice.exception.ResourceNotFoundException;
import com.example.restaurantservice.model.Restaurant;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final ImageStorageService imageStorageService;

    public PagedResponseDto<RestaurantResponseDto> getAllRestaurants(
            int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Restaurant> restaurantPage = restaurantRepository.findAll(pageable);

        List<RestaurantResponseDto> content = restaurantPage.getContent()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PagedResponseDto<>(
                content,
                restaurantPage.getNumber(),
                restaurantPage.getSize(),
                restaurantPage.getTotalElements(),
                restaurantPage.getTotalPages(),
                restaurantPage.isLast()
        );
    }

    public RestaurantResponseDto getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return convertToDto(restaurant);
    }

    @Transactional
    public RestaurantResponseDto createRestaurant(RestaurantRequestDto requestDto) {
        Restaurant restaurant = new Restaurant();
        updateRestaurantFromDto(restaurant, requestDto);

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created with id: {}", savedRestaurant.getId());

        return convertToDto(savedRestaurant);
    }

    @Transactional
    public RestaurantResponseDto updateRestaurant(Long id, RestaurantRequestDto requestDto) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        updateRestaurantFromDto(restaurant, requestDto);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant updated with id: {}", id);

        return convertToDto(updatedRestaurant);
    }

    @Transactional
    public RestaurantResponseDto updateRestaurantImage(Long id, MultipartFile imageFile) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        try {
            // Удаляем старое изображение если есть
            if (restaurant.getImageUrl() != null) {
                imageStorageService.deleteImage(restaurant.getImageUrl());
            }

            // Сохраняем новое изображение
            String imageUrl = imageStorageService.storeImage(imageFile, "restaurants");
            restaurant.setImageUrl(imageUrl);

            Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
            log.info("Restaurant image updated for id: {}", id);

            return convertToDto(updatedRestaurant);
        } catch (Exception e) {
            log.error("Failed to update restaurant image for id: {}", id, e);
            throw new BusinessException("Failed to update image: " + e.getMessage(), e, "IMAGE_UPLOAD_ERROR");
        }
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        // Soft delete
        restaurant.setDeleted(true);
        restaurantRepository.save(restaurant);

        // Удаляем изображение если есть
        if (restaurant.getImageUrl() != null) {
            imageStorageService.deleteImage(restaurant.getImageUrl());
        }

        log.info("Restaurant soft deleted with id: {}", id);
    }

    public List<RestaurantResponseDto> searchRestaurants(String query) {
        List<Restaurant> restaurants = restaurantRepository.searchByNameOrCuisine(query);
        return restaurants.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RestaurantResponseDto convertToDto(Restaurant restaurant) {
        RestaurantResponseDto dto = new RestaurantResponseDto();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setCuisine(restaurant.getCuisine());
        dto.setAddress(restaurant.getAddress());
        dto.setDescription(restaurant.getDescription());
        dto.setPhoneNumber(restaurant.getPhoneNumber());
        dto.setEmail(restaurant.getEmail());
        dto.setOpeningHours(restaurant.getOpeningHours());
        dto.setImageUrl(restaurant.getImageUrl());
        dto.setCreatedAt(restaurant.getCreatedAt());
        dto.setUpdatedAt(restaurant.getUpdatedAt());
        return dto;
    }

    private void updateRestaurantFromDto(Restaurant restaurant, RestaurantRequestDto dto) {
        restaurant.setName(dto.getName());
        restaurant.setCuisine(dto.getCuisine());
        restaurant.setAddress(dto.getAddress());
        restaurant.setDescription(dto.getDescription());
        restaurant.setPhoneNumber(dto.getPhoneNumber());
        restaurant.setEmail(dto.getEmail());
        restaurant.setOpeningHours(dto.getOpeningHours());
    }
}