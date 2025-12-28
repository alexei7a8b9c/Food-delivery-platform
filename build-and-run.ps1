# Сохраните как build-and-run.ps1 в корне проекта

Write-Host "=========================================" -ForegroundColor Green
Write-Host "   Запуск микросервисов Food Delivery" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Сборка всех сервисов
Write-Host "1. Сборка Java сервисов..." -ForegroundColor Yellow

$services = @("eureka-server", "user-service", "restaurant-service", "order-service", "api-gateway")

foreach ($service in $services) {
    Write-Host "   Сборка $service..." -ForegroundColor Cyan
    cd ".\$service"

    # Проверяем, есть ли pom.xml
    if (Test-Path "pom.xml") {
        mvn clean package -DskipTests

        # Создаем простой Dockerfile если его нет
        if (!(Test-Path "Dockerfile")) {
            @"
FROM openjdk:21-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
"@ | Out-File -FilePath "Dockerfile" -Encoding UTF8
        }

        # Собираем Docker образ
        docker build -t $service .
    }

    cd ".."
}

# 2. Запуск Eureka Server
Write-Host "`n2. Запуск Eureka Server..." -ForegroundColor Yellow
docker run -d --name eureka-server --network food-delivery-network `
    -p 8761:8761 `
    -e SPRING_PROFILES_ACTIVE=docker `
    eureka-server

Write-Host "   Ожидание запуска Eureka (15 сек)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# 3. Запуск бизнес-сервисов
Write-Host "`n3. Запуск бизнес-сервисов..." -ForegroundColor Yellow

# User Service
docker run -d --name user-service --network food-delivery-network `
    -p 8083:8083 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/user_db `
    -e SPRING_DATASOURCE_USERNAME=user_db `
    -e SPRING_DATASOURCE_PASSWORD=user_db `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    user-service

# Restaurant Service
docker run -d --name restaurant-service --network food-delivery-network `
    -p 8082:8082 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/restaurant_db `
    -e SPRING_DATASOURCE_USERNAME=restaurant_db `
    -e SPRING_DATASOURCE_PASSWORD=restaurant_db `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    restaurant-service

# Order Service
docker run -d --name order-service --network food-delivery-network `
    -p 8081:8081 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/order_db `
    -e SPRING_DATASOURCE_USERNAME=order_db `
    -e SPRING_DATASOURCE_PASSWORD=order_db `
    -e SPRING_REDIS_HOST=redis `
    -e SPRING_REDIS_PASSWORD=redis123 `
    -e SPRING_RABBITMQ_HOST=rabbitmq `
    -e SPRING_RABBITMQ_USERNAME=admin `
    -e SPRING_RABBITMQ_PASSWORD=admin123 `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    order-service

Write-Host "   Ожидание запуска сервисов (30 сек)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 4. Запуск API Gateway
Write-Host "`n4. Запуск API Gateway..." -ForegroundColor Yellow
docker run -d --name api-gateway --network food-delivery-network `
    -p 8080:8080 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    api-gateway

# 5. Запуск Frontend (если есть)
Write-Host "`n5. Запуск Frontend..." -ForegroundColor Yellow
cd ".\front-end"

if (Test-Path "package.json") {
    # Создаем простой Dockerfile для фронтенда
    @"
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"@ | Out-File -FilePath "Dockerfile" -Encoding UTF8

    docker build -t frontend .

    docker run -d --name frontend --network food-delivery-network `
        -p 3000:80 `
        -e REACT_APP_API_URL=http://localhost:8080 `
        frontend
}

cd ".."

# 6. Проверка
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "   ПРОВЕРКА СИСТЕМЫ" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

docker ps

Write-Host "`n=== СЕРВИСЫ ДОСТУПНЫ ===" -ForegroundColor Green
Write-Host "Eureka Server:    http://localhost:8761" -ForegroundColor Cyan
Write-Host "API Gateway:      http://localhost:8080" -ForegroundColor Cyan
Write-Host "User Service:     http://localhost:8083/actuator/health" -ForegroundColor Cyan
Write-Host "Restaurant Service: http://localhost:8082/actuator/health" -ForegroundColor Cyan
Write-Host "Order Service:    http://localhost:8081/actuator/health" -ForegroundColor Cyan
Write-Host "Frontend:         http://localhost:3000" -ForegroundColor Cyan
Write-Host "RabbitMQ UI:      http://localhost:15672 (admin/admin123)" -ForegroundColor Cyan
Write-Host "PostgreSQL:       localhost:5432 (admin/admin123)" -ForegroundColor Cyan

Write-Host "`nДля проверки логов используйте:" -ForegroundColor Gray
Write-Host "docker logs <имя_контейнера>" -ForegroundColor Gray
Write-Host "docker-compose logs -f (в папке docker)" -ForegroundColor Gray