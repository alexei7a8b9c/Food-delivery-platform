package com.example.userservice.service;

import com.example.userservice.dto.TokenPair;
import com.example.userservice.model.RefreshToken;
import com.example.userservice.model.User;
import com.example.userservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-token.expiration:604800}")
    private Long refreshTokenExpirationSeconds;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String USER_TOKENS_PREFIX = "user_tokens:";

    @Transactional
    public String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        String key = REFRESH_TOKEN_PREFIX + token;

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationSeconds))
                .build();

        // Сохраняем в Redis с TTL
        redisTemplate.opsForValue().set(
                key,
                refreshToken,
                refreshTokenExpirationSeconds,
                TimeUnit.SECONDS
        );

        // Сохраняем связь пользователь -> токен
        String userTokensKey = USER_TOKENS_PREFIX + user.getId();
        redisTemplate.opsForSet().add(userTokensKey, token);
        redisTemplate.expire(userTokensKey, refreshTokenExpirationSeconds, TimeUnit.SECONDS);

        // Сохраняем в базу данных для истории
        refreshTokenRepository.save(refreshToken);

        log.info("Refresh token created for user: {} (ID: {})", user.getEmail(), user.getId());
        return token;
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        RefreshToken refreshToken = (RefreshToken) redisTemplate.opsForValue().get(key);

        if (refreshToken == null) {
            // Проверяем в базе данных
            refreshToken = refreshTokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

            if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Refresh token expired");
            }

            // Восстанавливаем в Redis
            redisTemplate.opsForValue().set(
                    key,
                    refreshToken,
                    refreshTokenExpirationSeconds,
                    TimeUnit.SECONDS
            );
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            deleteRefreshToken(token);
            throw new RuntimeException("Refresh token expired");
        }

        return refreshToken;
    }

    @Transactional
    public void deleteRefreshToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        RefreshToken refreshToken = (RefreshToken) redisTemplate.opsForValue().get(key);

        if (refreshToken != null) {
            // Удаляем из списка токенов пользователя
            String userTokensKey = USER_TOKENS_PREFIX + refreshToken.getUserId();
            redisTemplate.opsForSet().remove(userTokensKey, token);
        }

        // Удаляем сам токен
        redisTemplate.delete(key);
        refreshTokenRepository.deleteByToken(token);

        log.info("Refresh token deleted: {}", token);
    }

    @Transactional
    public void deleteAllUserTokens(Long userId) {
        String userTokensKey = USER_TOKENS_PREFIX + userId;
        Object tokens = redisTemplate.opsForSet().members(userTokensKey);

        if (tokens != null) {
            // Удаляем все токены пользователя
            for (String token : (Iterable<String>) tokens) {
                redisTemplate.delete(REFRESH_TOKEN_PREFIX + token);
            }
        }

        // Удаляем список токенов пользователя
        redisTemplate.delete(userTokensKey);

        // Удаляем из базы данных
        refreshTokenRepository.deleteAllByUserId(userId);

        log.info("All refresh tokens deleted for user ID: {}", userId);
    }

    @Transactional
    public TokenPair generateTokenPair(User user) {
        String accessToken = jwtService.generateToken(user.getEmail(), user.getId());
        String refreshToken = createRefreshToken(user);

        return TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .refreshTokenExpiresIn(refreshTokenExpirationSeconds)
                .build();
    }

    @Transactional(readOnly = true)
    public boolean isRefreshTokenValid(String token) {
        try {
            validateRefreshToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}