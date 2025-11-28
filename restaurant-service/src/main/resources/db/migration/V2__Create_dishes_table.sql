CREATE TABLE dish (
                      id BIGSERIAL PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      description TEXT,
                      price INTEGER NOT NULL,
                      image_url VARCHAR(500),
                      restaurant_id BIGINT NOT NULL,  -- ИЗМЕНИТЕ INTEGER на BIGINT
                      CONSTRAINT fk_dish_restaurant
                          FOREIGN KEY (restaurant_id)
                              REFERENCES restaurant(id)
                              ON DELETE CASCADE
);

CREATE INDEX idx_dish_restaurant_id ON dish(restaurant_id);
CREATE INDEX idx_dish_price ON dish(price);