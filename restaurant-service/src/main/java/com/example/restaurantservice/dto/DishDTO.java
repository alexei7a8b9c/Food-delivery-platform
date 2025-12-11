package com.example.restaurantservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishDTO {
    private Long id;

    @NotBlank(message = "Название блюда обязательно")
    @Size(min = 2, max = 100, message = "Название должно быть от 2 до 100 символов")
    @Pattern(regexp = "^[A-Za-zА-Яа-яЁё0-9\\s\\-\\.,!?'\"()]+$",
            message = "Название может содержать только буквы, цифры, пробелы и основные знаки препинания")
    private String name;

    @Size(max = 500, message = "Описание не должно превышать 500 символов")
    @Pattern(regexp = "^[A-Za-zА-Яа-яЁё0-9\\s\\-\\.,!?'\"()\\n\\r]*$",
            message = "Описание содержит недопустимые символы")
    private String description;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "1.00", message = "Цена должна быть не менее 1.00")
    @DecimalMax(value = "10000.00", message = "Цена не может превышать 10,000.00")
    @Digits(integer = 5, fraction = 2, message = "Цена должна иметь максимум 5 цифр до запятой и 2 после")
    private BigDecimal price;

    @Size(max = 2048, message = "Ссылка на изображение слишком длинная")
    @Pattern(regexp = "^(http://|https://|/).*$",
            message = "Ссылка на изображение должна начинаться с http://, https:// или /")
    private String imageUrl;

    @NotNull(message = "ID ресторана обязателен")
    @Positive(message = "ID ресторана должен быть положительным числом")
    private Long restaurantId;

    private String restaurantName;

    private boolean deleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}