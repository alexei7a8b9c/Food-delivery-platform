-- Создание баз данных для микросервисов
\c postgres admin;

-- Создаем БД для каждого микросервиса
CREATE DATABASE user_db;
CREATE DATABASE order_db;
CREATE DATABASE restaurant_db;

-- Создаем пользователей для каждой БД
CREATE USER user_db WITH PASSWORD 'user_db';
CREATE USER order_db WITH PASSWORD 'order_db';
CREATE USER restaurant_db WITH PASSWORD 'restaurant_db';

-- Даем права на соответствующие БД
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_db;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_db;
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_db;

-- Даем права на схему public
\c user_db admin;
GRANT ALL ON SCHEMA public TO user_db;

\c order_db admin;
GRANT ALL ON SCHEMA public TO order_db;

\c restaurant_db admin;
GRANT ALL ON SCHEMA public TO restaurant_db;