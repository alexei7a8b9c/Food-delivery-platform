package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.RestaurantDTO;
import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.entity.Restaurant;
import com.example.restaurantservice.entity.Dish;
import org.springframework.stereotype.Service;

@Service
public class MapperService {

    public RestaurantDTO toRestaurantDTO(Restaurant restaurant) {
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

    public Restaurant toRestaurantEntity(RestaurantDTO dto) {
        return Restaurant.builder()
                .name(dto.getName())
                .cuisine(dto.getCuisine())
                .address(dto.getAddress())
                .build();
    }

    public DishDTO toDishDTO(Dish dish) {
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

    public Dish toDishEntity(DishDTO dto, Restaurant restaurant) {
        return Dish.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .restaurant(restaurant)
                .build();
    }
}