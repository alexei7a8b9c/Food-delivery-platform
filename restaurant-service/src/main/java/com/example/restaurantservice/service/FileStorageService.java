package com.example.restaurantservice.service;

import com.example.restaurantservice.dto.FileUploadResponse;
import com.example.restaurantservice.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.annotation.PostConstruct;
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
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private final List<String> allowedImageExtensions = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
    );

    private final long maxFileSize = 10 * 1024 * 1024; // 10MB

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            log.info("Upload directory created: {}", uploadPath);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialize upload directory!", e);
        }
    }

    public FileUploadResponse storeFile(MultipartFile file) {
        // Validate file
        validateFile(file);

        // Generate unique filename
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + "." + fileExtension;

        try {
            // Copy file to target location
            Path targetLocation = Paths.get(uploadDir).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Create file download URI
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();

            log.info("File uploaded successfully: {} -> {}", originalFileName, fileName);

            return new FileUploadResponse(
                    fileName,
                    fileDownloadUri,
                    file.getContentType(),
                    file.getSize()
            );

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            if (fileName == null || fileName.isEmpty()) {
                return;
            }

            // Extract just the filename from URL if full URL is provided
            String simpleFileName = extractFileNameFromUrl(fileName);

            Path filePath = Paths.get(uploadDir).resolve(simpleFileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", simpleFileName);
            }
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file " + fileName, ex);
        }
    }

    public boolean fileExists(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return false;
        }

        String simpleFileName = extractFileNameFromUrl(fileName);
        Path filePath = Paths.get(uploadDir).resolve(simpleFileName);
        return Files.exists(filePath);
    }

    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new FileStorageException("File is empty!");
        }

        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new FileStorageException("File size exceeds maximum limit of 10MB!");
        }

        // Check file extension
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName).toLowerCase();

        if (fileExtension.isEmpty()) {
            throw new FileStorageException("File has no extension!");
        }

        if (!allowedImageExtensions.contains(fileExtension)) {
            throw new FileStorageException(
                    String.format("Only image files are allowed! Allowed extensions: %s. Your file: %s",
                            allowedImageExtensions, fileExtension)
            );
        }
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return "";
    }

    public String extractFileNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return "";
        }

        // If it's a full URL, extract just the filename
        if (url.contains("/")) {
            return url.substring(url.lastIndexOf("/") + 1);
        }

        return url;
    }
}