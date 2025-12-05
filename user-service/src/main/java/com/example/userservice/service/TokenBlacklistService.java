// TokenBlacklistService.java
package com.example.userservice.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {
    private final ConcurrentHashMap<String, LocalDateTime> blacklistedTokens = new ConcurrentHashMap<>();

    public void blacklistToken(String token) {
        if (token != null && !token.isEmpty()) {
            blacklistedTokens.put(token, LocalDateTime.now().plusHours(24));
        }
    }

    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        return blacklistedTokens.containsKey(token);
    }
}
