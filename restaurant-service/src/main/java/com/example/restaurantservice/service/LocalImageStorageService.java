package com.example.restaurantservice.service;

import com.example.restaurantservice.exception.ImageStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalImageStorageService implements ImageStorageService {

    @Value("${app.images.upload-dir:./images}")
    private String uploadDir;

    @Value("${app.images.base-url:/images}")
    private String baseUrl;

    @Value("${app.images.allowed-formats:jpg,jpeg,png,gif,webp}")
    private String allowedFormats;

    @Value("${app.images.max-size-mb:5}")
    private int maxSizeMB;

    @Override
    public String storeImage(MultipartFile file, String directory) throws ImageStorageException {
        try {
            // Валидация файла
            validateImage(file);

            // Создаем директорию если не существует
            Path uploadPath = Paths.get(uploadDir, directory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Генерируем уникальное имя файла
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Сохраняем файл
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Возвращаем относительный путь
            String relativePath = directory + "/" + uniqueFilename;
            log.info("Image saved successfully: {}", relativePath);

            return baseUrl + "/" + relativePath;
        } catch (IOException e) {
            log.error("Failed to store image: {}", e.getMessage(), e);
            throw new ImageStorageException("Failed to store image: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty() || !imageUrl.startsWith(baseUrl)) {
            return false;
        }

        try {
            // Извлекаем путь из URL
            String relativePath = imageUrl.replaceFirst(baseUrl + "/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Image deleted successfully: {}", filePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            return false;
        }
    }

    @Override
    public String getImagePath(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty() || !imageUrl.startsWith(baseUrl)) {
            return null;
        }
        String relativePath = imageUrl.replaceFirst(baseUrl + "/", "");
        return Paths.get(uploadDir, relativePath).toString();
    }

    @Override
    public boolean validateImage(MultipartFile file) throws ImageStorageException {
        if (file == null || file.isEmpty()) {
            throw new ImageStorageException("File is empty or null");
        }

        // Проверка размера файла
        long maxSizeBytes = maxSizeMB * 1024 * 1024L;
        if (file.getSize() > maxSizeBytes) {
            throw new ImageStorageException(
                    String.format("File size exceeds maximum allowed size of %dMB", maxSizeMB)
            );
        }

        // Проверка типа файла
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new ImageStorageException("File has no name");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        List<String> allowedExtensions = Arrays.asList(allowedFormats.toLowerCase().split(","));

        if (!allowedExtensions.contains(fileExtension.replace(".", ""))) {
            throw new ImageStorageException(
                    String.format("File type not allowed. Allowed types: %s", allowedFormats)
            );
        }

        // Проверка MIME типа
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ImageStorageException("File is not an image");
        }

        return true;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}