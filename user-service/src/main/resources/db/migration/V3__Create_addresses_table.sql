CREATE TABLE address (
                         id BIGSERIAL PRIMARY KEY,
                         street VARCHAR(255) NOT NULL,
                         city VARCHAR(100) NOT NULL,
                         zip VARCHAR(20) NOT NULL,
                         state VARCHAR(100) NOT NULL,
                         country VARCHAR(100) NOT NULL,
                         user_id BIGINT NOT NULL,

                         CONSTRAINT fk_address_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id)
                                 ON DELETE CASCADE
);

CREATE INDEX idx_address_user_id ON address(user_id);
CREATE INDEX idx_address_city ON address(city);
CREATE INDEX idx_address_country ON address(country);