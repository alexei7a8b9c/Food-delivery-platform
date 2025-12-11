-- Добавляем поля для soft delete и аудита в restaurant
ALTER TABLE restaurant
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Добавляем поля для soft delete и аудита в dish
ALTER TABLE dish
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Индексы для ускорения запросов с учетом soft delete
CREATE INDEX IF NOT EXISTS idx_restaurant_deleted ON restaurant(deleted);
CREATE INDEX IF NOT EXISTS idx_dish_deleted ON dish(deleted);