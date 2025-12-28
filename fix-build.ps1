# Собираем каждый сервис с Spring Boot плагином
$services = @("eureka-server", "user-service", "restaurant-service", "order-service", "api-gateway")

foreach ($service in $services) {
    Write-Host "Пересборка $service..." -ForegroundColor Yellow

    # Создаём временный pom.xml с плагином
    $pomContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.fooddelivery</groupId>
    <artifactId>$service</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"@

    # Сохраняем временный pom.xml
    $pomContent | Out-File -FilePath ".\$service\temp-pom.xml" -Encoding UTF8

    # Собираем
    docker run --rm -v ${PWD}:/app -w /app/$service maven:3.9-eclipse-temurin-21 `
      mvn -f temp-pom.xml clean package -DskipTests
}