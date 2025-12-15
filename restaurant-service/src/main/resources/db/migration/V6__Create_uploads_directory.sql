-- Создание директории для загрузки файлов
-- Это SQL комментарий, фактически директория создается приложением
-- Но можно добавить проверочные таблицы если нужно

CREATE TABLE IF NOT EXISTS file_metadata (
                                             id SERIAL PRIMARY KEY,
                                             file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dish_id BIGINT,
    FOREIGN KEY (dish_id) REFERENCES dish(id) ON DELETE SET NULL
    );

CREATE INDEX idx_file_metadata_dish ON file_metadata(dish_id);