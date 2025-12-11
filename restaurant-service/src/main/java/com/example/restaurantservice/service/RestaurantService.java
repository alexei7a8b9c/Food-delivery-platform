package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.RestaurantDTO;
import com.example.restaurantservice.dto.SearchCriteria;
import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.entity.Restaurant;
import com.example.restaurantservice.entity.Dish;
import com.example.restaurantservice.exception.ResourceNotFoundException;
import com.example.restaurantservice.exception.ValidationException;
import com.example.restaurantservice.repository.RestaurantRepository;
import com.example.restaurantservice.repository.DishRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final DishRepository dishRepository;

    private RestaurantDTO toDTO(Restaurant restaurant) {
        return RestaurantDTO.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .cuisine(restaurant.getCuisine())
                .address(restaurant.getAddress())
                .deleted(restaurant.isDeleted())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .build();
    }

    private Restaurant toEntity(RestaurantDTO dto) {
        return Restaurant.builder()
                .name(dto.getName())
                .cuisine(dto.getCuisine())
                .address(dto.getAddress())
                .build();
    }

    private DishDTO dishToDTO(Dish dish) {
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

    @Transactional(readOnly = true)
    public Page<RestaurantDTO> getAllRestaurants(SearchCriteria criteria) {
        Pageable pageable = createPageable(criteria);
        Page<Restaurant> restaurantsPage;

        if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isEmpty()) {
            restaurantsPage = restaurantRepository.searchAllFields(criteria.getSearchTerm(), pageable);
        } else if (criteria.getCuisine() != null && !criteria.getCuisine().isEmpty()) {
            restaurantsPage = restaurantRepository.findByCuisineAndDeletedFalse(criteria.getCuisine(), pageable);
        } else {
            restaurantsPage = restaurantRepository.findByDeletedFalse(pageable);
        }

        return restaurantsPage.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public RestaurantDTO getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + id));

        if (restaurant.isDeleted()) {
            throw new ResourceNotFoundException("Ресторан был удален с id: " + id);
        }

        return toDTO(restaurant);
    }

    @Transactional(readOnly = true)
    public Page<DishDTO> getRestaurantDishes(Long restaurantId, SearchCriteria criteria) {
        if (!restaurantRepository.existsByIdAndDeletedFalse(restaurantId)) {
            throw new ResourceNotFoundException("Ресторан не найден с id: " + restaurantId);
        }

        Pageable pageable = createPageable(criteria);
        Page<Dish> dishesPage = dishRepository.findByRestaurantIdAndFilters(
                restaurantId,
                criteria.getSearchTerm(),
                criteria.getMinPrice(),
                criteria.getMaxPrice(),
                pageable);

        return dishesPage.map(this::dishToDTO);
    }

    @Transactional
    public RestaurantDTO createRestaurant(RestaurantDTO restaurantDTO) {
        if (restaurantRepository.existsByNameAndDeletedFalse(restaurantDTO.getName())) {
            throw new ValidationException("Ресторан с названием '" + restaurantDTO.getName() + "' уже существует");
        }

        Restaurant restaurant = toEntity(restaurantDTO);
        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Создан ресторан с id: {}", saved.getId());
        return toDTO(saved);
    }

    @Transactional
    public RestaurantDTO updateRestaurant(Long id, RestaurantDTO restaurantDTO) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + id));

        if (existing.isDeleted()) {
            throw new ResourceNotFoundException("Ресторан был удален с id: " + id);
        }

        if (!existing.getName().equals(restaurantDTO.getName()) &&
                restaurantRepository.existsByNameAndDeletedFalse(restaurantDTO.getName())) {
            throw new ValidationException("Ресторан с названием '" + restaurantDTO.getName() + "' уже существует");
        }

        existing.setName(restaurantDTO.getName());
        existing.setCuisine(restaurantDTO.getCuisine());
        existing.setAddress(restaurantDTO.getAddress());

        Restaurant updated = restaurantRepository.save(existing);
        log.info("Обновлен ресторан с id: {}", id);
        return toDTO(updated);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + id));

        if (restaurant.isDeleted()) {
            throw new ResourceNotFoundException("Ресторан уже удален с id: " + id);
        }

        restaurant.softDelete();
        restaurantRepository.save(restaurant);
        log.info("Удален ресторан с id: {}", id);
    }

    @Transactional
    public void restoreRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не найден с id: " + id));

        if (!restaurant.isDeleted()) {
            throw new ValidationException("Ресторан не удален с id: " + id);
        }

        restaurant.restore();
        restaurantRepository.save(restaurant);
        log.info("Восстановлен ресторан с id: {}", id);
    }

    @Transactional(readOnly = true)
    public List<RestaurantDTO> getDeletedRestaurants() {
        return restaurantRepository.findByDeletedTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDTO> getRestaurantsWithDishes(SearchCriteria criteria) {
        Pageable pageable = createPageable(criteria);
        Page<Restaurant> restaurantsPage = restaurantRepository.findByDeletedFalse(pageable);

        return restaurantsPage.getContent().stream()
                .map(restaurant -> {
                    RestaurantDTO dto = toDTO(restaurant);
                    List<DishDTO> dishes = dishRepository.findByRestaurantId(restaurant.getId(), pageable)
                            .stream()
                            .map(this::dishToDTO)
                            .collect(Collectors.toList());
                    dto.setDishes(dishes);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private Pageable createPageable(SearchCriteria criteria) {
        Sort sort = Sort.by(criteria.getSortDirection().equalsIgnoreCase("desc") ?
                        Sort.Direction.DESC : Sort.Direction.ASC,
                criteria.getSortBy());
        return PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
    }
}