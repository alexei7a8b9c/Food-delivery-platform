# Save as: start-platform.ps1
Write-Host "Starting Food Delivery Platform..." -ForegroundColor Green

# 1. Create network
Write-Host "1. Creating network..." -ForegroundColor Yellow
docker network create food-delivery-network 2>$null

# 2. Start infrastructure
Write-Host "2. Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..." -ForegroundColor Yellow
cd docker
docker-compose up -d
cd ..

Write-Host "   Waiting 30 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 3. Start Eureka
Write-Host "3. Starting Eureka Server..." -ForegroundColor Yellow
docker run -d --name eureka-server --network food-delivery-network -p 8761:8761 -e SPRING_PROFILES_ACTIVE=docker eureka-server

Write-Host "   Waiting 30 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 4. Create services compose file
Write-Host "4. Creating services configuration..." -ForegroundColor Yellow

$composeContent = @'
version: '3.8'
networks:
  food-delivery-network:
    external: true
services:
  user-service:
    image: user-service:latest
    container_name: user-service
    ports: ["8083:8083"]
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/user_db
      SPRING_DATASOURCE_USERNAME: user_db
      SPRING_DATASOURCE_PASSWORD: user_db
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
      JWT_SECRET: mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey
    networks: ["food-delivery-network"]
    depends_on: ["eureka-server"]

  restaurant-service:
    image: restaurant-service:latest
    container_name: restaurant-service
    ports: ["8082:8082"]
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/restaurant_db
      SPRING_DATASOURCE_USERNAME: restaurant_db
      SPRING_DATASOURCE_PASSWORD: restaurant_db
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
      JWT_SECRET: mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey
    networks: ["food-delivery-network"]
    depends_on: ["eureka-server"]

  order-service:
    image: order-service:latest
    container_name: order-service
    ports: ["8081:8081"]
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/order_db
      SPRING_DATASOURCE_USERNAME: order_db
      SPRING_DATASOURCE_PASSWORD: order_db
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PASSWORD: redis123
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_USERNAME: admin
      SPRING_RABBITMQ_PASSWORD: admin123
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
      JWT_SECRET: mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey
    networks: ["food-delivery-network"]
    depends_on: ["eureka-server"]

  api-gateway:
    image: api-gateway:latest
    container_name: api-gateway
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: docker
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
      JWT_SECRET: mysecretkeymysecretkeymysecretkeymysecretkeymysecretkeymysecretkey
    networks: ["food-delivery-network"]
    depends_on: ["eureka-server"]

  frontend:
    image: frontend:latest
    container_name: frontend
    ports: ["3001:80"]
    environment:
      REACT_APP_API_URL: http://localhost:8080
    networks: ["food-delivery-network"]
    depends_on: ["api-gateway"]
'@

$composeContent | Out-File -FilePath "services-docker.yml" -Encoding UTF8

# 5. Start all services
Write-Host "5. Starting all services..." -ForegroundColor Yellow
docker-compose -f services-docker.yml up -d

Write-Host "   Waiting for full startup (90 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 90

# 6. Show result
Write-Host "`n✅ SYSTEM IS RUNNING!" -ForegroundColor Green
Write-Host "`n=== AVAILABLE SERVICES ===" -ForegroundColor Yellow
Write-Host "Eureka Server:       http://localhost:8761" -ForegroundColor Cyan
Write-Host "                     login: admin, password: admin123" -ForegroundColor Gray
Write-Host "API Gateway:         http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend:            http://localhost:3001" -ForegroundColor Cyan
Write-Host "RabbitMQ UI:         http://localhost:15672" -ForegroundColor Cyan
Write-Host "                     login: admin, password: admin123" -ForegroundColor Gray

Write-Host "`nHealth endpoints:" -ForegroundColor Yellow
Write-Host "User Service:        http://localhost:8083/actuator/health" -ForegroundColor Gray
Write-Host "Restaurant Service:  http://localhost:8082/actuator/health" -ForegroundColor Gray
Write-Host "Order Service:       http://localhost:8081/actuator/health" -ForegroundColor Gray

Write-Host "`n=== MANAGEMENT COMMANDS ===" -ForegroundColor Yellow
Write-Host "View logs:           docker logs [container_name] -f" -ForegroundColor Gray
Write-Host "Stop all:            docker-compose -f services-docker.yml down" -ForegroundColor Gray
Write-Host "Restart:             docker-compose -f services-docker.yml restart" -ForegroundColor Gray