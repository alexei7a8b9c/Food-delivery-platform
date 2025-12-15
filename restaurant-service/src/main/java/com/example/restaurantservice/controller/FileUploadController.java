package com.example.restaurantservice.controller;

import com.example.restaurantservice.dto.FileUploadResponse;
import com.example.restaurantservice.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Файлы", description = "API для загрузки и управления файлами")
@Slf4j
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузить файл")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Uploading file: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        try {
            FileUploadResponse response = fileStorageService.storeFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping(value = "/upload-dish-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузить изображение для блюда")
    public ResponseEntity<FileUploadResponse> uploadDishImage(@RequestParam("image") MultipartFile image) {
        log.info("Uploading dish image: {} ({} bytes)", image.getOriginalFilename(), image.getSize());

        try {
            FileUploadResponse response = fileStorageService.storeFile(image);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload dish image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{fileName}")
    @Operation(summary = "Удалить файл")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileName) {
        log.info("Deleting file: {}", fileName);

        try {
            fileStorageService.deleteFile(fileName);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Failed to delete file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check/{fileName}")
    @Operation(summary = "Проверить существование файла")
    public ResponseEntity<Boolean> checkFileExists(@PathVariable String fileName) {
        boolean exists = fileStorageService.fileExists(fileName);
        return ResponseEntity.ok(exists);
    }
}