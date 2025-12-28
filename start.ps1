# Food Delivery Platform - Startup Script
# With automatic Java detection

Write-Host "=========================================" -ForegroundColor Green
Write-Host " Starting Food Delivery Platform " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Add Maven to PATH
$env:PATH = "C:\Program Files\maven\bin;" + $env:PATH

# Find Java automatically
Write-Host "`nLooking for Java..." -ForegroundColor Cyan

# Try different Java locations
$javaPaths = @(
    "$env:USERPROFILE\.jdks\*",
    "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\*",
    "C:\Program Files\Java\*",
    "C:\Program Files (x86)\Java\*",
    "$env:ProgramFiles\Java\*"
)

$foundJava = $false

foreach ($pathPattern in $javaPaths) {
    $javaDirs = Get-ChildItem -Path $pathPattern -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path "$_\bin\java.exe" } |
                Sort-Object LastWriteTime -Descending

    if ($javaDirs) {
        $javaHome = $javaDirs[0].FullName
        $env:JAVA_HOME = $javaHome
        $env:PATH = "$javaHome\bin;" + $env:PATH
        Write-Host "Found Java at: $javaHome" -ForegroundColor Green
        $foundJava = $true
        break
    }
}

if (-not $foundJava) {
    # Try to use java from PATH
    try {
        $javaPath = (Get-Command java -ErrorAction Stop).Source
        $javaHome = Split-Path (Split-Path $javaPath)
        $env:JAVA_HOME = $javaHome
        Write-Host "Found Java in PATH: $javaHome" -ForegroundColor Green
        $foundJava = $true
    }
    catch {
        Write-Host "ERROR: Java not found!" -ForegroundColor Red
        Write-Host "Please install Java 21 or set JAVA_HOME manually" -ForegroundColor Yellow
        exit 1
    }
}

# Check Maven and Java
Write-Host "`nChecking environment..." -ForegroundColor Cyan

try {
    $mvnVersion = mvn --version 2>&1 | Select-Object -First 1
    Write-Host "Maven: $mvnVersion" -ForegroundColor Green
}
catch {
    Write-Host "Maven: NOT FOUND" -ForegroundColor Red
    exit 1
}

try {
    $javaVersion = java --version 2>&1 | Select-Object -First 1
    Write-Host "Java: $javaVersion" -ForegroundColor Green
}
catch {
    Write-Host "Java: NOT FOUND" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    docker version 2>&1 | Out-Null
    Write-Host "Docker: OK" -ForegroundColor Green
}
catch {
    Write-Host "Docker: NOT RUNNING" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Create network
Write-Host "`nCreating Docker network..." -ForegroundColor Cyan
docker network create food-delivery-network 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Network created" -ForegroundColor Green
}

# Build services
Write-Host "`nBuilding services..." -ForegroundColor Cyan

$services = @("eureka-server", "user-service", "restaurant-service", "order-service", "api-gateway")

foreach ($svc in $services) {
    Write-Host "  $svc..." -NoNewline

    if (Test-Path "$svc\pom.xml") {
        $current = Get-Location
        Set-Location $svc

        Write-Host " (building)..." -NoNewline -ForegroundColor Gray
        mvn clean package -DskipTests
        if ($LASTEXITCODE -eq 0) {
            docker build -t $svc:latest . 2>$null
            Write-Host " OK" -ForegroundColor Green
        }
        else {
            Write-Host " FAILED" -ForegroundColor Red
            Write-Host "    Maven error. Check $svc/pom.xml" -ForegroundColor Yellow
        }

        Set-Location $current
    }
    else {
        Write-Host " (no pom.xml)" -ForegroundColor Yellow
    }
}

# Build frontend (optional)
Write-Host "`nBuilding frontend (optional)..." -ForegroundColor Cyan
if (Test-Path "front-end\package.json") {
    $current = Get-Location
    Set-Location "front-end"

    Write-Host "  Installing dependencies..." -NoNewline
    npm ci --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green

        Write-Host "  Building React app..." -NoNewline
        npm run build --silent
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green

            Write-Host "  Creating Docker image..." -NoNewline
            docker build -t frontend:latest . 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host " OK" -ForegroundColor Green
            }
            else {
                Write-Host " FAILED" -ForegroundColor Red
            }
        }
        else {
            Write-Host " FAILED" -ForegroundColor Red
        }
    }
    else {
        Write-Host " FAILED" -ForegroundColor Red
    }

    Set-Location $current
}
else {
    Write-Host "  Frontend not found, skipping" -ForegroundColor Yellow
}

# Start infrastructure first
Write-Host "`nStarting infrastructure..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d postgres redis rabbitmq

Write-Host "  Waiting for infrastructure (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Start Eureka
Write-Host "`nStarting Eureka Server..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d eureka-server

Write-Host "  Waiting for Eureka (60s)..." -ForegroundColor Gray
Start-Sleep -Seconds 60

# Start microservices
Write-Host "`nStarting microservices..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d user-service restaurant-service order-service

Write-Host "  Waiting for microservices (60s)..." -ForegroundColor Gray
Start-Sleep -Seconds 60

# Start API Gateway and Frontend
Write-Host "`nStarting API Gateway and Frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d api-gateway frontend

Write-Host "  Final wait (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Display info
Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SYSTEM STATUS " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host "`nContainers:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`nACCESS LINKS:" -ForegroundColor Cyan
Write-Host "  Eureka:     http://localhost:8761 (admin/admin123)" -ForegroundColor White
Write-Host "  API:        http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor White

Write-Host "`nHealth checks:" -ForegroundColor Cyan
Write-Host "  User:       http://localhost:8083/actuator/health" -ForegroundColor Gray
Write-Host "  Restaurant: http://localhost:8082/actuator/health" -ForegroundColor Gray
Write-Host "  Order:      http://localhost:8081/actuator/health" -ForegroundColor Gray

Write-Host "`nCheck Eureka registration:" -ForegroundColor Yellow
Write-Host '  curl -u admin:admin123 http://localhost:8761/eureka/apps | findstr "name instance"' -ForegroundColor Gray

Write-Host "`nTroubleshooting:" -ForegroundColor Red
Write-Host "  View logs: docker-compose logs [service]" -ForegroundColor Gray
Write-Host "  Restart:   docker-compose restart [service]" -ForegroundColor Gray
Write-Host "  Stop all:  docker-compose down" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Green
