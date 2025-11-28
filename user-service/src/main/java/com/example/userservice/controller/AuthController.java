package com.example.userservice.controller;

import com.example.userservice.dto.AuthResponse;
import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.UserRegistrationRequest;
import com.example.userservice.model.User;
import com.example.userservice.service.JwtService;
import com.example.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        String token = jwtService.generateToken(user.getEmail(), user.getId());

        AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }

        String username = jwtService.extractUsername(token);
        Long userId = jwtService.extractUserId(token);
        User user = userService.findByEmail(username);

        AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
        return ResponseEntity.ok(response);
    }
}