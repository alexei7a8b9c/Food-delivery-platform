import com.example.restaurantservice.dto.RestaurantResponseDto;
import com.example.restaurantservice.exception.BusinessException;
import com.example.restaurantservice.exception.ImageStorageException;
import com.example.restaurantservice.exception.ResourceNotFoundException;
import com.example.restaurantservice.model.Restaurant;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;

// В методе updateRestaurantImage:
@Transactional
public RestaurantResponseDto updateRestaurantImage(Long id, MultipartFile imageFile) {
    Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

    try {
        // Удаляем старое изображение если есть
        if (restaurant.getImageUrl() != null) {
            imageStorageService.deleteImage(restaurant.getImageUrl());
        }

        // Сохраняем новое изображение
        String imageUrl = imageStorageService.storeImage(imageFile, "restaurants");
        restaurant.setImageUrl(imageUrl);

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant image updated for id: {}", id);

        return convertToDto(updatedRestaurant);
    } catch (ImageStorageException e) {
        log.error("Failed to update restaurant image for id: {}", id, e);
        throw new BusinessException("Failed to update image: " + e.getMessage(), e, "IMAGE_UPLOAD_ERROR");
    }
}