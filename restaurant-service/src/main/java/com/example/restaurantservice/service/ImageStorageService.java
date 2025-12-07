package com.example.restaurantservice.service;

import com.example.restaurantservice.exception.ImageStorageException;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    String storeImage(MultipartFile file, String directory) throws ImageStorageException;
    boolean deleteImage(String imageUrl);
    String getImagePath(String imageUrl);
    boolean validateImage(MultipartFile file) throws ImageStorageException;
}