package com.example.userservice.service;

import com.example.userservice.dto.JwtAuthenticationResponse;
import com.example.userservice.dto.RefreshTokenRequest;
import com.example.userservice.dto.SignInRequest;
import com.example.userservice.entity.RefreshToken;
import com.example.userservice.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public JwtAuthenticationResponse signIn(SignInRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = (User) userDetailsService.loadUserByUsername(request.getEmail());

        return generateTokenResponse(user);
    }

    @Transactional
    public JwtAuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (storedToken.isExpired() || storedToken.getRevoked()) {
            throw new RuntimeException("Refresh token expired or revoked");
        }

        refreshTokenService.revokeToken(storedToken);

        User user = storedToken.getUser();
        return generateTokenResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isEmpty()) {
            refreshTokenService.findByToken(refreshToken)
                    .ifPresent(refreshTokenService::revokeToken);
        }
    }

    private JwtAuthenticationResponse generateTokenResponse(User user) {
        var accessToken = jwtService.generateAccessToken(user);
        var refreshTokenEntity = refreshTokenService.createRefreshToken(user);

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenEntity.getToken())
                .accessTokenExpiresIn(jwtService.getAccessTokenExpiration())
                .refreshTokenExpiresIn(jwtService.getRefreshTokenExpiration())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }
}