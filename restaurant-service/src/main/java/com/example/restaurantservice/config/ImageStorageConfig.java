package com.example.restaurantservice.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ImageStorageConfig implements WebMvcConfigurer {

    private final String uploadDir = "./images";
    private final String imageUrl = "/images/**";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(imageUrl)
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600);
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> imageFilter() {
        FilterRegistrationBean<OncePerRequestFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {

                String requestUri = request.getRequestURI();

                // Проверяем, запрашивается ли изображение
                if (requestUri.startsWith("/images/")) {
                    String relativePath = requestUri.replaceFirst("/images/", "");
                    Path imagePath = Paths.get(uploadDir, relativePath);

                    // Если файл не существует, возвращаем 404
                    if (!Files.exists(imagePath) || !Files.isReadable(imagePath)) {
                        response.sendError(HttpServletResponse.SC_NOT_FOUND, "Image not found");
                        return;
                    }
                }

                filterChain.doFilter(request, response);
            }
        });
        registrationBean.addUrlPatterns("/images/*");
        return registrationBean;
    }
}