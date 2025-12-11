package com.example.restaurantservice.mapper;

import com.example.restaurantservice.dto.RestaurantDTO;
import com.example.restaurantservice.entity.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    @Mapping(source = "deleted", target = "deleted")
    RestaurantDTO toDTO(Restaurant restaurant);

    Restaurant toEntity(RestaurantDTO dto);
}