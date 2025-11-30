package com.example.restaurantservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/actuator/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Restaurant Service is healthy");
    }

    @GetMapping("/actuator/info")
    public ResponseEntity<String> info() {
        return ResponseEntity.ok("Restaurant Service v1.0");
    }
}