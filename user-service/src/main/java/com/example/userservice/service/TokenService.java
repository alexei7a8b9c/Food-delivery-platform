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

    @Value("${jwt.refresh-token.expiration:604800}") // 7 дней в секундах
    private Long refreshTokenExpirationSeconds;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";

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

        redisTemplate.opsForValue().set(
                key,
                refreshToken,
                refreshTokenExpirationSeconds,
                TimeUnit.SECONDS
        );

        refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created for user: {}", user.getEmail());
        return token;
    }

    public RefreshToken validateRefreshToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        RefreshToken refreshToken = (RefreshToken) redisTemplate.opsForValue().get(key);

        if (refreshToken == null) {
            refreshToken = refreshTokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

            if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Refresh token expired");
            }

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

    public void deleteRefreshToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        redisTemplate.delete(key);
        refreshTokenRepository.deleteByToken(token);
        log.info("Refresh token deleted: {}", token);
    }

    public void deleteAllUserTokens(Long userId) {
        refreshTokenRepository.findAllByUserId(userId)
                .forEach(token -> redisTemplate.delete(REFRESH_TOKEN_PREFIX + token.getToken()));

        refreshTokenRepository.deleteAllByUserId(userId);
        log.info("All refresh tokens deleted for user: {}", userId);
    }

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
}