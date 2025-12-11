package com.example.restaurantservice.mapper;

import com.example.restaurantservice.dto.DishDTO;
import com.example.restaurantservice.entity.Dish;
import com.example.restaurantservice.entity.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DishMapper {

    @Mapping(source = "restaurant", target = "restaurantId", qualifiedByName = "restaurantToId")
    @Mapping(source = "restaurant", target = "restaurantName", qualifiedByName = "restaurantToName")
    @Mapping(source = "deleted", target = "deleted")
    DishDTO toDTO(Dish dish);

    @Mapping(source = "restaurantId", target = "restaurant", qualifiedByName = "idToRestaurant")
    Dish toEntity(DishDTO dto);

    @Named("restaurantToId")
    default Long restaurantToId(Restaurant restaurant) {
        return restaurant != null ? restaurant.getId() : null;
    }

    @Named("restaurantToName")
    default String restaurantToName(Restaurant restaurant) {
        return restaurant != null ? restaurant.getName() : null;
    }

    @Named("idToRestaurant")
    default Restaurant idToRestaurant(Long restaurantId) {
        if (restaurantId == null) {
            return null;
        }
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        return restaurant;
    }
}