package com.example.restaurantservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {
    private Long id;

    @NotBlank(message = "Название ресторана обязательно")
    @Size(min = 2, max = 100, message = "Название должно быть от 2 до 100 символов")
    @Pattern(regexp = "^[A-Za-zА-Яа-яЁё0-9\\s\\-\\.,!?'\"()&]+$",
            message = "Название может содержать только буквы, цифры, пробелы и основные знаки препинания")
    private String name;

    @NotBlank(message = "Тип кухни обязателен")
    @Size(min = 2, max = 50, message = "Тип кухни должен быть от 2 до 50 символов")
    @Pattern(regexp = "^[A-Za-zА-Яа-яЁё\\s\\-]+$",
            message = "Тип кухни может содержать только буквы, пробелы и дефисы")
    private String cuisine;

    @NotBlank(message = "Адрес обязателен")
    @Size(min = 5, max = 255, message = "Адрес должен быть от 5 до 255 символов")
    @Pattern(regexp = "^[A-Za-zА-Яа-яЁё0-9\\s\\-\\.,/№«»\"()]+$",
            message = "Адрес содержит недопустимые символы")
    private String address;

    private boolean deleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DishDTO> dishes;
}