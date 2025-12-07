package com.example.restaurantservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DishResponseDto {
    private Long id;
    private String name;
    private String description;
    private Integer price;
    private String imageUrl;
    private String category;
    private Integer preparationTime;
    private Boolean isAvailable;
    private Long restaurantId;
    private String restaurantName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}