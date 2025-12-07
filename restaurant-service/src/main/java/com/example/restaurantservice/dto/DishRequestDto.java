package com.example.restaurantservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DishRequestDto {

    @NotBlank(message = "Dish name is required")
    @Size(min = 2, max = 100, message = "Dish name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be at least 1")
    private Integer price;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Min(value = 1, message = "Preparation time must be at least 1 minute")
    private Integer preparationTime;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
}