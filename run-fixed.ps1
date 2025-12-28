# run-fixed.ps1
$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Green
Write-Host " Запуск Food Delivery Platform (FIXED)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Создание сети
Write-Host "1. Создание сети..." -ForegroundColor Yellow
docker network inspect food-delivery-network 2>$null
if ($LASTEXITCODE -ne 0) {
    docker network create food-delivery-network
}

# 2. Запуск инфраструктуры (PostgreSQL, Redis, RabbitMQ)
Write-Host "2. Запуск инфраструктуры..." -ForegroundColor Yellow
Set-Location "docker"
docker-compose up -d
Start-Sleep -Seconds 10
Set-Location ".."

# 3. Запуск Eureka Server
Write-Host "3. Запуск Eureka Server..." -ForegroundColor Yellow
docker run -d --name eureka-server --network food-delivery-network `
    -p 8761:8761 `
    -e SPRING_SECURITY_USER_NAME=admin `
    -e SPRING_SECURITY_USER_PASSWORD=admin123 `
    eureka-server

Write-Host "Ожидание запуска Eureka (20 сек)..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# 4. Проверка Eureka
Write-Host "Проверка Eureka..." -ForegroundColor Yellow
curl http://admin:admin123@localhost:8761/eureka/apps

# 5. Запуск микросервисов (В ПРАВИЛЬНОМ ПОРЯДКЕ)
Write-Host "4. Запуск микросервисов..." -ForegroundColor Yellow

# User Service
Write-Host "Запуск User Service..." -ForegroundColor Cyan
docker run -d --name user-service --network food-delivery-network `
    -p 8083:8083 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/user_db `
    -e SPRING_DATASOURCE_USERNAME=user_db `
    -e SPRING_DATASOURCE_PASSWORD=user_db `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:admin123@eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    user-service

Start-Sleep -Seconds 10

# Restaurant Service
Write-Host "Запуск Restaurant Service..." -ForegroundColor Cyan
docker run -d --name restaurant-service --network food-delivery-network `
    -p 8082:8082 `
    -e SPRING_PROFILES_ACTIVE=docker `
    -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/restaurant_db `
    -e SPRING_DATASOURCE_USERNAME=restaurant_db `
    -e SPRING_DATASOURCE_PASSWORD=restaurant_db `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:admin123@eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    restaurant-service

Start-Sleep -Seconds 10

# Order Service
Write-Host "Запуск Order Service..." -ForegroundColor Cyan
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
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:admin123@eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    order-service

Start-Sleep -Seconds 15

# 6. Проверка регистрации в Eureka
Write-Host "Проверка регистрации..." -ForegroundColor Yellow
curl -u admin:admin123 http://localhost:8761/eureka/apps | Select-String -Pattern "USER-SERVICE|RESTAURANT-SERVICE|ORDER-SERVICE"

# 7. Запуск API Gateway (после всех сервисов)
Write-Host "5. Запуск API Gateway..." -ForegroundColor Yellow
docker run -d --name api-gateway --network food-delivery-network `
    -p 8080:8080 `
    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:admin123@eureka-server:8761/eureka/ `
    -e JWT_SECRET=mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey `
    api-gateway

# 8. Итоговая проверка
Write-Host "=========================================" -ForegroundColor Green
Write-Host "ИТОГОВАЯ ПРОВЕРКА" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

docker ps

Write-Host "`n=== ДОСТУПНЫЕ URL ===" -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "Login: admin / admin123" -ForegroundColor Gray
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor Cyan

Write-Host "`n=== ПРОВЕРКА СЕРВИСОВ ===" -ForegroundColor Green
Write-Host "User Service Health: http://localhost:8083/actuator/health" -ForegroundColor Cyan
Write-Host "Restaurant Service Health: http://localhost:8082/actuator/health" -ForegroundColor Cyan
Write-Host "Order Service Health: http://localhost:8081/actuator/health" -ForegroundColor Cyan

Write-Host "`n=== ПРОВЕРКА ЛОГОВ ===" -ForegroundColor Yellow
Write-Host "Для проверки Eureka: docker logs eureka-server" -ForegroundColor Gray
Write-Host "Для проверки сервисов: docker logs <имя_сервиса>" -ForegroundColor Gray