#!/bin/bash

echo "Building Food Delivery Platform..."

# Сборка всех модулей
mvn clean install -DskipTests

# Сборка Docker образов
docker-compose -f docker-compose.full.yml build

# Запуск бэкенда
docker-compose -f docker-compose.full.yml up -d

echo "Waiting for backend services to start..."
sleep 30

echo "Building frontend..."
cd front-end
npm install
npm run build

echo "Starting frontend..."
docker-compose up -d

cd ..

echo "Food Delivery Platform is starting..."
echo "Frontend: http://localhost:3000"
echo "Eureka Server: http://localhost:8761"
echo "API Gateway: http://localhost:8080"
echo "User Service: http://localhost:8083"
echo "Restaurant Service: http://localhost:8082"
echo "Order Service: http://localhost:8081"
echo "RabbitMQ Management: http://localhost:15672 (admin/admin123)"
echo "PostgreSQL: localhost:5432 (admin/admin123)"