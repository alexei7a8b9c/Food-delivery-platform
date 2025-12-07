package com.example.restaurantservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RestaurantResponseDto {
    private Long id;
    private String name;
    private String cuisine;
    private String address;
    private String description;
    private String phoneNumber;
    private String email;
    private String openingHours;
    private String imageUrl;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}