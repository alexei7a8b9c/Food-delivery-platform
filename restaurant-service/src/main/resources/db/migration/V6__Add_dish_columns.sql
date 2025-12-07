ALTER TABLE dish
    ADD COLUMN category VARCHAR(50),
ADD COLUMN preparation_time INTEGER,
ADD COLUMN is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT fk_dish_restaurant_new FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE;

CREATE INDEX idx_dish_deleted ON dish(deleted);
CREATE INDEX idx_dish_available ON dish(is_available);
CREATE INDEX idx_dish_category ON dish(category);