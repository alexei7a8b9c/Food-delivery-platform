package com.example.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;           // Для старого формата
    private String accessToken;     // Для нового формата
    private String refreshToken;    // Для нового формата
    private Long accessTokenExpiresIn;
    private Long refreshTokenExpiresIn;
    private String email;
    private String fullName;
    private Long userId;

    // Геттер для совместимости
    public String getAccessToken() {
        return accessToken != null ? accessToken : token;
    }

    // Сеттер для совместимости
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        this.token = accessToken; // Также устанавливаем старое поле
    }
}