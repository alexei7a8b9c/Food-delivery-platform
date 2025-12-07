package com.example.restaurantservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RestaurantRequestDto {

    @NotBlank(message = "Restaurant name is required")
    @Size(min = 2, max = 100, message = "Restaurant name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Cuisine is required")
    @Size(min = 2, max = 50, message = "Cuisine must be between 2 and 50 characters")
    private String cuisine;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 100, message = "Opening hours must not exceed 100 characters")
    private String openingHours;
}