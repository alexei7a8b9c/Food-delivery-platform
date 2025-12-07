package com.example.restaurantservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageUploadResponseDto {
    private String imageUrl;
    private String message;
}