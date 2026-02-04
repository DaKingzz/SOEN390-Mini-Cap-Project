# SonarQube Setup Guide

This guide explains how to set up SonarQube for code coverage and quality analysis.

## Prerequisites

- Docker and Docker Compose installed
- Java 21
- Maven (or use the included `./mvnw` wrapper)

## Quick Start

### 1. Start the containers

```bash
docker compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- SonarQube server (port 9000)
- SonarQube database

Wait about 60 seconds for SonarQube to initialize.

### 2. Configure SonarQube

1. Open http://localhost:9000
2. Login with default credentials: `admin` / `admin`
3. You'll be prompted to change the password - set a new one
4. Generate an access token:
   - Click your profile icon (top right) → **My Account**
   - Go to **Security** tab
   - Under "Generate Tokens":
     - Enter a name (e.g., `local-dev`)
     - **Select type: `Global Analysis Token`** (important!)
     - Click **Generate** and copy the token

### 3. Create your .env file

Create a `.env` file in the backend directory (this file is gitignored):

```bash
echo "SONAR_TOKEN=your-token-here" > .env
```

Replace `your-token-here` with the token you copied.

### 4. Run the analysis

```bash
./sonar.sh
```

Or manually:
```bash
source .env && ./mvnw clean verify sonar:sonar -Dsonar.token=$SONAR_TOKEN
```

### 5. View results

Open http://localhost:9000/dashboard?id=soen390-backend

## Useful Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# View SonarQube logs
docker compose logs -f sonarqube

# Check container status
docker compose ps

# Run tests with coverage only (no SonarQube)
./mvnw clean test

# View local coverage report
open target/site/jacoco/index.html
```

## Troubleshooting

### SonarQube not starting
Wait 60-90 seconds after `docker compose up -d`. Check logs:
```bash
docker compose logs sonarqube
```

### Token not working
Generate a new token in SonarQube UI: My Account → Security → Generate Token. Make sure to select **Global Analysis Token** as the type.

### Port 9000 already in use
Stop other services using port 9000 or change the port in `docker-compose.yml`

## CI/CD Integration

For CI/CD pipelines, set `SONAR_TOKEN` as a secret environment variable in your CI platform.
