package com.example.restaurantservice.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private String requestId;

    // Конструктор без path и requestId для обратной совместимости
    public ErrorResponse(LocalDateTime timestamp, int status, String error, String message) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = "";
        this.requestId = "";
    }

    // Статический метод для создания ErrorResponse
    public static ErrorResponse of(int status, String error, String message, String path) {
        ErrorResponse response = new ErrorResponse();
        response.setTimestamp(LocalDateTime.now());
        response.setStatus(status);
        response.setError(error);
        response.setMessage(message);
        response.setPath(path);
        response.setRequestId(java.util.UUID.randomUUID().toString());
        return response;
    }
}