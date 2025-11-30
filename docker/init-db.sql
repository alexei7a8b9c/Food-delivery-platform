-- Create databases
CREATE DATABASE user_db;
CREATE DATABASE order_db;
CREATE DATABASE restaurant_db;

-- Create users for each database
CREATE USER user_db WITH PASSWORD 'user_db';
CREATE USER order_db WITH PASSWORD 'order_db';
CREATE USER restaurant_db WITH PASSWORD 'restaurant_db';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_db;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_db;
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_db;

-- Grant schema privileges
\c user_db;
GRANT ALL ON SCHEMA public TO user_db;

\c order_db;
GRANT ALL ON SCHEMA public TO order_db;

\c restaurant_db;
GRANT ALL ON SCHEMA public TO restaurant_db;