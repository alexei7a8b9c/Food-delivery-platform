INSERT INTO address (street, city, zip, state, country, user_id) VALUES
                                                                     ('123 Main Street', 'New York', '10001', 'NY', 'USA', 1),
                                                                     ('456 Central Park West', 'New York', '10023', 'NY', 'USA', 1),
                                                                     ('789 Oak Avenue', 'Los Angeles', '90210', 'CA', 'USA', 2),
                                                                     ('321 Pine Road', 'Chicago', '60601', 'IL', 'USA', 3),
                                                                     ('654 Maple Drive', 'San Francisco', '94102', 'CA', 'USA', 4),
                                                                     ('987 Elm Street', 'Austin', '73301', 'TX', 'USA', 5),
                                                                     ('111 Birch Lane', 'Boston', '02101', 'MA', 'USA', 6),
                                                                     ('222 Cedar Road', 'Miami', '33101', 'FL', 'USA', 2)
    ON CONFLICT DO NOTHING;